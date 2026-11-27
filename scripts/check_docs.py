#!/usr/bin/env python3
"""Check bilingual Markdown documentation in this repository.

Checks:
  1. Every authored Markdown file has its language pair (X.md <-> X_jp.md).
  2. Each file of a pair links to the other.
  3. Relative links and images point to files that exist.
  4. With --base REF: a document changed since REF has its pair changed too,
     and a change to AGENTS.md is mirrored in the Copilot instructions (warning).

Usage:
  python3 scripts/check_docs.py              # full check
  python3 scripts/check_docs.py --base origin/main
  python3 scripts/check_docs.py --hook       # Claude Code Stop hook mode

Exit codes: 0 = no errors, 1 = errors found.
In --hook mode, errors exit with 2 so Claude Code shows them to Claude,
unless the hook already blocked once in this turn (stop_hook_active).
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Files that are required tool configuration and intentionally have no pair.
UNPAIRED = {"CLAUDE.md", "CLAUDE.local.md"}

LINK_RE = re.compile(r"!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+\"[^\"]*\")?\s*\)")
SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")
FENCE_RE = re.compile(r"^\s*(```|~~~)")
INLINE_CODE_RE = re.compile(r"`[^`]*`")


def git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], cwd=ROOT, check=True, capture_output=True, text=True
    ).stdout


def markdown_files() -> list[str]:
    out = git("ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "*.md")
    return sorted(p for p in out.split("\0") if p and (ROOT / p).is_file())


def counterpart(path: str) -> str | None:
    if Path(path).name in UNPAIRED:
        return None
    if path.endswith("_jp.md"):
        return path[: -len("_jp.md")] + ".md"
    return path[: -len(".md")] + "_jp.md"


def links_in(path: str) -> list[str]:
    targets: list[str] = []
    in_fence = False
    for line in (ROOT / path).read_text(encoding="utf-8").splitlines():
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        targets.extend(LINK_RE.findall(INLINE_CODE_RE.sub("", line)))
    return targets


def resolve(source: str, target: str) -> str | None:
    """Return the repository-relative path a link points to, or None to skip."""
    if SCHEME_RE.match(target) or target.startswith("#") or "{{" in target:
        return None
    target = target.split("#", 1)[0].split("?", 1)[0]
    if not target:
        return None
    base = ROOT if target.startswith("/") else (ROOT / source).parent
    resolved = (base / target.lstrip("/")).resolve()
    try:
        return resolved.relative_to(ROOT).as_posix()
    except ValueError:
        return "../" + target  # outside the repository; reported as missing


def check_files(files: list[str]) -> list[str]:
    errors: list[str] = []
    for path in files:
        resolved_links = set()
        for target in links_in(path):
            resolved = resolve(path, target)
            if resolved is None:
                continue
            resolved_links.add(resolved)
            if not (ROOT / resolved).exists():
                errors.append(f"{path}: broken relative link -> {target}")

        pair = counterpart(path)
        if pair is None:
            continue
        if not (ROOT / pair).is_file():
            errors.append(f"{path}: missing language pair {pair}")
        elif "/templates/" not in f"/{path}" and pair not in resolved_links:
            errors.append(f"{path}: no link to its language pair {pair}")
    return errors


def check_changed_pairs(base: str) -> tuple[list[str], list[str]]:
    merge_base = git("merge-base", base, "HEAD").strip()
    changed = set(git("diff", "--name-only", merge_base).split())
    changed |= set(git("ls-files", "--others", "--exclude-standard").split())

    errors: list[str] = []
    for path in sorted(p for p in changed if p.endswith(".md")):
        pair = counterpart(path)
        if pair and pair not in changed:
            errors.append(f"{path}: changed since {base}, but {pair} was not")

    warnings: list[str] = []
    if "AGENTS.md" in changed and ".github/copilot-instructions.md" not in changed:
        warnings.append(
            "AGENTS.md changed but .github/copilot-instructions.md did not; "
            "confirm the Copilot copy of the essential rules is still aligned"
        )
    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--base", help="also check that pairs changed together since REF")
    parser.add_argument("--hook", action="store_true", help="run as a Claude Code Stop hook")
    args = parser.parse_args()

    stop_hook_active = False
    if args.hook:
        try:
            stop_hook_active = bool(json.load(sys.stdin).get("stop_hook_active"))
        except (json.JSONDecodeError, AttributeError):
            pass

    errors = check_files(markdown_files())
    warnings: list[str] = []
    if args.base:
        pair_errors, warnings = check_changed_pairs(args.base)
        errors += pair_errors

    for warning in warnings:
        print(f"warning: {warning}", file=sys.stderr)

    if not errors:
        if not args.hook:
            print("check_docs: OK")
        return 0

    report = "check_docs found problems:\n" + "\n".join(f"  - {e}" for e in errors)
    print(report, file=sys.stderr)
    if args.hook:
        return 0 if stop_hook_active else 2
    return 1


if __name__ == "__main__":
    sys.exit(main())
