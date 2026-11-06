# dev-lab

- Personal workspace for learning, experimentation, and development.

[日本語](README_jp.md)

## Directory Structure

```text
dev-lab/
├── .github/
│   ├── copilot-instructions.md
│   └── copilot-instructions_jp.md
├── learning/
│   └── ai/
│       ├── AI_GUIDE.md
│       ├── AI_GUIDE_jp.md
│       ├── agent_architecture.md
│       ├── agent_architecture_jp.md
│       ├── local_llm_environment.md
│       └── local_llm_environment_jp.md
├── projects/
│   └── blockwave/
│       ├── README.md
│       ├── README_jp.md
│       ├── src/
│       └── tests/
├── .gitignore
├── AGENTS.md
├── AGENTS_jp.md
├── README.md
└── README_jp.md
```

- Create directories only when adding content; do not add placeholders for empty directories.
- Organize study materials under `learning/` by topic.
- Add `experiments/`, `projects/`, `notes/`, or `scripts/` when needed, and keep setup instructions and validation commands alongside each project or experiment.

## Repository Rules

- [Shared rules](AGENTS.md) ([日本語](AGENTS_jp.md))
- [Copilot instructions](.github/copilot-instructions.md) ([日本語](.github/copilot-instructions_jp.md))

## AI Learning Guides

- AI tools and workflows: [English](learning/ai/AI_GUIDE.md) ([日本語](learning/ai/AI_GUIDE_jp.md))
- Local LLM inference environments: [English](learning/ai/local_llm_environment.md) ([日本語](learning/ai/local_llm_environment_jp.md)) — GPU/VRAM/bandwidth, RTX and DGX examples, inference engines, open-weight models, and setup examples.
- [A visual guide to AI agents](learning/ai/agent_architecture.md) ([日本語](learning/ai/agent_architecture_jp.md)) — eight diagrams, including PNG illustrations.

## Learning Note Skill

- [Procedure](.agents/skills/learning_note/SKILL.md) ([日本語](.agents/skills/learning_note/SKILL_jp.md))
- [Instructions vs. skills and usage](learning/ai/AI_GUIDE.md#instructions-vs-skills) ([日本語](learning/ai/AI_GUIDE_jp.md#instructions-と-skills-の違い))

## Projects

- [BLOCKWAVE](projects/blockwave/README.md) ([日本語](projects/blockwave/README_jp.md)) — a TypeScript Tetris game for the browser and terminal, with a shared engine, touch controls, and automated tests.
