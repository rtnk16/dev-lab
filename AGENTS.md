# Repository Instructions

[日本語](AGENTS_jp.md)

## Scope and Purpose

This repository is a personal workspace for learning, experimentation, and development. These instructions apply throughout the repository. Follow applicable host instructions and the user's task requirements; report unresolved conflicts rather than silently choosing a rule.

This English file is the canonical source of shared repository rules. Keep the essential rules in `.github/copilot-instructions.md` aligned with it. Japanese translations are reading aids, not separate sources of instructions.

## Documentation and Translation

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

- Use English commit messages and group each commit around one purpose.
- Write pull request titles and descriptions in English.
- Follow the user's authorized scope for commits, pushes, and pull requests. Do not infer permission to publish from a request to edit files.
- Push directly to `main` or force-push only when explicitly instructed. Do not reset or overwrite unrelated work.
