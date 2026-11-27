# dev-lab

[日本語](README_jp.md)

A personal workspace for learning, experimentation, and development.

## Contents

### AI Learning Guides

- [Local LLM inference environments](learning/ai/local_llm_environment.md) ([日本語](learning/ai/local_llm_environment_jp.md)) — GPU/VRAM/bandwidth, RTX and DGX examples, inference engines, open-weight models, and setup examples.
- [AI agent architecture](learning/ai/agent_architecture.md) ([日本語](learning/ai/agent_architecture_jp.md)) — an overview diagram followed by components, execution environments, I/O, and customization mechanisms; diagrams are embedded Mermaid.

### Projects

- [BLOCKWAVE](projects/blockwave/README.md) ([日本語](projects/blockwave/README_jp.md)) — a TypeScript falling-block puzzle game for the browser and terminal, with a shared engine, touch controls, and automated tests.

## Repository Rules

- [Repository rules](CLAUDE.md) ([日本語](CLAUDE_jp.md)) — Claude Code loads `CLAUDE.md` automatically. This repository is configured for Claude Code only.
- The `codex` branch keeps the earlier Codex and Copilot layout (`AGENTS.md`, `.github/copilot-instructions.md`, `.agents/skills/`).

## Using Claude Code

- Shared settings live in `.claude/settings.json`: read-only Git and validation commands are pre-allowed, and a `Stop` hook runs the documentation check when Claude finishes a turn.
- Put personal overrides in `.claude/settings.local.json` or `CLAUDE.local.md`; both are ignored by Git.
- Run project skills with a slash command. For example, `/learning-note` creates or updates bilingual learning notes; see [its procedure](.claude/skills/learning-note/SKILL.md) ([日本語](.claude/skills/learning-note/SKILL_jp.md)).

## Validation

- Prerequisite: Python 3.9 or later and Git.
- Check documentation pairs and links:

  ```bash
  python3 scripts/check_docs.py
  ```

  Expected result: `check_docs: OK` and exit code 0. Problems are listed with exit code 1.
- Before a pull request, also check that each changed document's language pair changed:

  ```bash
  python3 scripts/check_docs.py --base origin/main
  ```

- GitHub Actions runs the same checks on pushes and pull requests (`.github/workflows/checks.yml`). The BLOCKWAVE tests and build run only when `projects/blockwave/` or the workflow file changes; otherwise that job is skipped.

## Directory Structure

```text
dev-lab/
├── .claude/              Claude Code settings and project skills
├── .github/workflows/    GitHub Actions checks
├── learning/<topic>/     Learning notes, one English/Japanese pair per subject
├── projects/<name>/      Applications, each with its own README pair
├── scripts/              Repository tools such as check_docs.py
├── CLAUDE.md             Repository rules (Japanese: CLAUDE_jp.md)
└── README.md             This file (Japanese: README_jp.md)
```

- Naming and placement rules are in [Organization and Naming](CLAUDE.md#organization-and-naming).
