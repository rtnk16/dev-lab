---
name: learning_note
description: Create or update bilingual learning notes in dev-lab with sourced explanations, practical examples, and honest validation results. Use when asked to document a learning topic, not for every documentation edit.
---

# Learning Note

[日本語](SKILL_jp.md)

## When to Use

Use this skill when the user asks to create or update a learning note about a specific topic. Follow the repository's `AGENTS.md`. This procedure does not grant permission to commit, push, publish, install dependencies, or perform consequential external actions.

## Procedure

1. **Inspect and scope.** Read repository instructions and related notes. Identify the topic, intended audience, and learning goal. Infer a reasonable beginner-friendly scope when unspecified; ask only if missing information prevents useful progress. Preserve existing work.
2. **Choose a location.** Use `learning/<topic>/<subject>.md` and `<subject>_jp.md`, with lowercase `snake_case` names. Reuse suitable directories and notes. Create directories only when adding content.
3. **Gather evidence.** Prefer official documentation and primary sources. Record source titles, URLs, and relevant versions. Distinguish facts, interpretations, and assumptions. If browsing is unavailable, disclose that references were not checked; do not invent sources or claim current verification.
4. **Draft in English.** Start from [the template](templates/learning_note.md), adapting sections to the topic and removing unused sections and placeholders. Explain the purpose, core concepts, and at least one concrete example. Include limitations or common mistakes where helpful.
5. **Validate examples.** For runnable examples, state prerequisites, commands, and expected results. Run safe, relevant examples when the environment supports them. Avoid destructive operations and unnecessary dependencies. Label observed results separately from expected results; report failures and unrun checks honestly. For conceptual topics, check that examples support the explanation instead of adding artificial execution steps.
6. **Translate.** Create the Japanese version using [the Japanese template](templates/learning_note_jp.md). Preserve meaning, section order, examples, warnings, code, commands, paths, and identifiers. Translate explanatory text. Add reciprocal relative links.
7. **Review.** Check factual support, translation consistency, relative-link targets, code fences, and whitespace. Use `git diff --check` for tracked changes and also inspect new files, which that command alone does not cover. Do not leave template placeholders in finished notes.
8. **Report.** List created or updated files, key sources, checks performed, and limitations. Commit or push only within the user's authorized scope; use English commit messages and PR titles/descriptions.

## Completion Criteria

- An English note and matching `_jp.md` translation exist and link to each other.
- Explanations have concrete examples and appropriate references.
- No unused placeholders remain; verification claims match actual results.
- Existing work is preserved and no unrelated changes are introduced.

## Example Request

```text
Use learning_note to explain Linux processes and threads for a beginner.
Include a safe example that can be run locally and references to official documentation.
```
