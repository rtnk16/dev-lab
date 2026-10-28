# Instructions and Skills

[日本語](instructions_and_skills_jp.md)

## The Difference

Instructions define rules that apply across tasks within their scope. A skill supplies a reusable procedure for a particular kind of task. Both can contain instructions, but their purpose and loading behavior differ.

| | Instructions | Skill |
| --- | --- | --- |
| Main question | What rules should work follow? | How should this task be performed? |
| Example | Write English documentation and a Japanese translation | Research a topic, draft a note, translate it, and validate it |
| Scope | Tasks covered by the instruction file | A selected task matching the skill |
| Loading | Depends on host discovery and directory scope | Depends on host support, discovery, and explicit or automatic selection |
| Repository example | `AGENTS.md` | `.agents/skills/learning_note/SKILL.md` |

Keep shared rules in `AGENTS.md`; avoid copying every rule into each skill. A skill should refer to those rules and provide task-specific steps. It does not override higher-priority instructions or grant extra permissions.

## This Repository's Example

`AGENTS.md` says to create English documentation with a matching `_jp.md` translation and to avoid empty directories. These rules also apply when working without a skill.

The `learning_note` skill explains how to choose a topic's scope, gather sources, create a concrete example, validate it, and produce the two language versions. Its templates help give notes a consistent starting structure.

## Using learning_note

The skill is stored in `.agents/skills/learning_note/`, a repository skill location supported by Codex. Discovery and invocation can vary by host and version. This location does not guarantee automatic discovery by every Copilot client.

In a host that discovers it, explicitly request `learning_note` through the supported skill interface. Otherwise, ask the assistant to read and follow `.agents/skills/learning_note/SKILL.md`; this is a manual fallback, not proof of native skill registration.

```text
Use learning_note to create a beginner's note about Linux processes and threads.
Include a safe runnable example and official references.
```

Check that the assistant loaded the procedure and produced both language versions with honest validation results. Commit and push only when authorized. Creating the files alone does not demonstrate skill discovery in a fresh session or successful execution of the full workflow.
