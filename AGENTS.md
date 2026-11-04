# Repository Instructions

[日本語](AGENTS_jp.md)

## Scope and Purpose

- This repository is a personal workspace for learning, experimentation, and development.
- These instructions apply throughout the repository.
- Follow applicable host instructions and the user's task requirements; report unresolved conflicts rather than silently choosing a rule.

- This English file is the canonical source of shared repository rules.
- Keep the essential rules in `.github/copilot-instructions.md` aligned with it.
- Japanese translations are reading aids, not separate sources of instructions.

## Documentation and Translation

- Write for the intended reader using plain language. Introduce unfamiliar terms with a short definition before using them in detailed explanations.
- For conceptual learning materials, prefer “short explanation → diagram → concrete example” for each major topic. Use a consistent example across related sections and move advanced details into optional or collapsible supplements when helpful.
- Use diagrams actively to explain roles, relationships, information flow, execution locations, and boundaries. Split complex diagrams into focused views; do not impose a fixed diagram count or add decorative repetition.
- Prefer Mermaid for editable flows and ASCII trees for directories. Add PNG illustrations when they improve readability, sharing, or compatibility with viewers that cannot render Mermaid. Keep editable sources or a reproducible generation script alongside the material and document generation prerequisites and commands.
- Give diagrams descriptive labels and alt text, explain how to read them, and check text legibility, arrow direction, clipping, and consistency with the prose. Keep diagrams aligned between languages; report rendering checks that were not run.

- Prefer concise bullet points, with one main idea per item. Use short prose only when it improves clarity.
- Include diagrams where they clarify relationships, structure, or workflows. Prefer Mermaid for flows and ASCII trees for directories; avoid decorative or redundant diagrams.
- Keep diagrams consistent between English and Japanese versions; translate explanatory labels while preserving identifiers and behavior.

- Write documentation in English first, then add a Japanese translation beside it using the `_jp.md` suffix: `README.md` → `README_jp.md`.
- Update both language versions in the same commit whenever their content changes.
- Add relative links between the English and Japanese versions.
- Preserve code, commands, paths, API names, identifiers, and machine-readable keys when translating. Translate explanatory prose and example text where appropriate without changing behavior.
- Keep the meaning, structure, examples, and warnings consistent across languages. If a discrepancy is found, correct the Japanese translation against the English source.
- Use these rules for authored documentation, including instruction files. Do not rename required tool configuration files or translate generated or third-party files merely to create language pairs.

## Organization and Naming

- Create directories only when adding content. Do not create empty directories or `.gitkeep` placeholders.
- Put study materials under `learning/` by topic. Add `experiments/`, `projects/`, `notes/`, or `scripts/` only when needed.
- Use lowercase `snake_case` for new file and directory names. Preserve conventional names such as `README.md`, `AGENTS.md`, `SKILL.md`, required configuration filenames, and existing names such as `AI_GUIDE.md`.
- Keep setup instructions and validation commands near the relevant project or experiment.

## Learning Materials and Examples

- Include the purpose, explanation, concrete examples, and references where useful. Choose sections appropriate to the material rather than adding empty boilerplate.
- Distinguish quotations, sourced facts, personal interpretation, and unverified assumptions. Cite sources for borrowed material and respect licenses.
- For runnable examples, document prerequisites, execution commands, and expected results.
- For experiments, record the goal, environment, procedure, results, and interpretation. Include measurement conditions for benchmarks.

## Changes and Validation

- Inspect existing files and instructions before editing. Keep changes focused and preserve unrelated user work.
- Add dependencies only when needed. Use existing package managers and lockfiles; avoid unnecessary dependency updates.
- Run checks appropriate to the change. For documentation, check formatting, relative links, and consistency between language versions. For code, use relevant existing tests and build commands.
- Report passed, failed, skipped, and unrun checks accurately. Do not claim unexecuted commands succeeded.
- Never commit credentials, personal information, local-only configuration, dependency caches, or generated build outputs. Keep safe configuration examples free of secrets and update `.gitignore` when necessary.

## Git Workflow

- Before starting or resuming each task, check the current branch and working tree, then run `git pull` with an explicit remote and the intended integration branch (the repository default unless specified otherwise) before editing files. For example, use `git pull --ff-only origin main` when a fast-forward is possible. Also synchronize the working branch's upstream when it exists, and reread any updated repository instructions after pulling.
- A missing upstream or failed pull does not count as synchronization. If an upstream was deleted, explicitly pull the intended integration branch. Preserve local changes and resolve conflicts safely; if synchronization remains blocked, report the blocker before starting edits. Do not reset or discard unrelated work to make a pull succeed.
- Use English commit messages and group each commit around one purpose.
- Write pull request titles and descriptions in English.
- After each completed change, validate it, commit it, and push to the working branch unless the user explicitly requests otherwise. Report the commit SHA and push result.
- After validation, commit, and a successful push, check for an open pull request for the working branch. If none exists and there are changes to propose, create a draft pull request targeting the intended integration branch (the repository default unless specified otherwise). If one exists, update its title and description to reflect the final changes and validation, preserving relevant existing context and review state. Avoid duplicate pull requests. Report the PR URL. Do not merge, enable auto-merge, publish releases, or deploy unless explicitly requested. If authentication or permissions prevent PR creation or updates, report the blocker without claiming success.
- Push directly to `main` or force-push only when explicitly instructed. Do not reset or overwrite unrelated work.
