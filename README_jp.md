# dev-lab

- 学習、実験、開発のための個人用ワークスペースです。

[English](README.md)

## ディレクトリ構成

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

- ディレクトリは、内容を追加するときにのみ作成します。
- 空ディレクトリを維持するためのプレースホルダーは追加しません。 学習資料は `learning/` 配下にトピック別に整理します。
- 必要に応じて `experiments/`、`projects/`、 `notes/`、`scripts/` を追加し、各プロジェクトや実験の近くにセットアップ手順と検証コマンドを記載します。

## リポジトリのルール

- [共通ルール（英語）](AGENTS.md)（[日本語](AGENTS_jp.md)）
- [Copilot 向けの指示（英語）](.github/copilot-instructions.md)（[日本語](.github/copilot-instructions_jp.md)）

## AI 学習ガイド

- AI ツールとワークフロー: [英語版](learning/ai/AI_GUIDE.md)（[日本語版](learning/ai/AI_GUIDE_jp.md)）
- ローカル LLM の推論環境: [英語版](learning/ai/local_llm_environment.md)（[日本語版](learning/ai/local_llm_environment_jp.md)）— GPU・VRAM・帯域、RTX・DGX の具体例、推論エンジン、オープンウェイトモデル、導入例を解説します。
- [図でわかるAIエージェントの仕組み](learning/ai/agent_architecture_jp.md)（[英語](learning/ai/agent_architecture.md)）— PNGを含む8点の図で解説します。

## 学習ノートの Skill

- [手順（英語）](.agents/skills/learning_note/SKILL.md)（[日本語](.agents/skills/learning_note/SKILL_jp.md)）
- [Instructions と Skills の違い・使い方（英語）](learning/ai/AI_GUIDE.md#instructions-vs-skills)（[日本語](learning/ai/AI_GUIDE_jp.md#instructions-と-skills-の違い)）

## プロジェクト

- [BLOCKWAVE](projects/blockwave/README_jp.md)（[English](projects/blockwave/README.md)）— 共通エンジン、タッチ操作、自動テストを備えた、ブラウザとターミナルで遊べるTypeScriptのテトリスゲームです。
