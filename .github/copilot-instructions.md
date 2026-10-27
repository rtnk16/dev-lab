# Copilot Repository Instructions

[日本語](copilot-instructions_jp.md)

This is a personal repository for learning, experimentation, and development. The canonical shared rules are in [AGENTS.md](../AGENTS.md); read it when file access is available. Essential rules are repeated here so they do not depend on following a link. Keep this file aligned with that source. Japanese translations are reading aids, not separate instruction sources. Follow applicable host instructions and user requirements; report unresolved conflicts.

- Write authored documentation in English first and add a Japanese `_jp.md` translation beside it. Update both in the same commit and add reciprocal relative links. Preserve code, commands, paths, API names, identifiers, and machine-readable keys; translate prose without changing behavior. Keep meaning, structure, examples, and warnings consistent. English is canonical. Do not rename required configuration files or translate generated or third-party files just to create pairs.
- Create directories only when adding content. Do not add empty directories or `.gitkeep`. Organize study materials under `learning/` by topic; create `experiments/`, `projects/`, `notes/`, and `scripts/` only as needed.
- Use lowercase `snake_case` for new names, except conventional names, required configuration filenames, and existing names. Keep setup and validation instructions near their projects or experiments.
- Include purpose, explanations, examples, and references where useful, without empty boilerplate. Distinguish sourced facts, quotations, interpretations, and assumptions; cite borrowed material and respect licenses. Document prerequisites, commands, and expected results for runnable examples. Record experiment goals, environments, procedures, results, and interpretation, including benchmark conditions.
- Inspect existing files before editing, keep changes focused, and preserve unrelated user work. Add only necessary dependencies using existing package managers and lockfiles; avoid unrelated updates.
- Validate appropriately: check documentation formatting, relative links, and translation consistency; use relevant existing tests and builds for code. Report passed, failed, skipped, and unrun checks accurately.
- Never commit credentials, personal information, local-only configuration, dependency caches, or generated build outputs. Use secret-free configuration examples and maintain `.gitignore` as needed.
- Use English commit messages and one purpose per commit. Commit, push, and create pull requests only within the user's authorized scope; editing alone does not authorize publication. Direct pushes to `main` and force pushes require explicit instructions. Do not reset or overwrite unrelated work.
