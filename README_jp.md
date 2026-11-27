# dev-lab

- 学習、実験、開発のための個人用ワークスペースです。

[English](README.md)

## ディレクトリ構成

```text
dev-lab/
├── .claude/
│   ├── settings.json
│   └── skills/
│       └── learning-note/
│           ├── SKILL.md
│           ├── SKILL_jp.md
│           └── templates/
├── .github/
│   └── workflows/
│       └── checks.yml
├── learning/
│   └── ai/
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
├── scripts/
│   └── check_docs.py
├── .gitignore
├── CLAUDE.md
├── CLAUDE_jp.md
├── README.md
└── README_jp.md
```

- ディレクトリは、内容を追加するときにのみ作成します。
- 空ディレクトリを維持するためのプレースホルダーは追加しません。 学習資料は `learning/` 配下にトピック別に整理します。
- 必要に応じて `experiments/`、`projects/`、 `notes/`、`scripts/` を追加し、各プロジェクトや実験の近くにセットアップ手順と検証コマンドを記載します。

## リポジトリのルール

- [リポジトリのルール（英語）](CLAUDE.md)（[日本語](CLAUDE_jp.md)）— Claude Code は `CLAUDE.md` を自動で読み込みます。このリポジトリは Claude Code 専用です。
- `codex` ブランチには、以前の Codex・Copilot 向けの構成（`AGENTS.md`、`.github/copilot-instructions.md`、`.agents/skills/`）を保存しています。

## Claude Code の使い方

- 共有設定は `.claude/settings.json` にあります。読み取り系の Git コマンドと検証コマンドをあらかじめ許可し、Claude がターンを終えるときに `Stop` hook でドキュメントの検証を実行します。
- 個人用の上書き設定は `.claude/settings.local.json` か `CLAUDE.local.md` に書きます。どちらも Git の追跡対象外です。
- プロジェクトのスキルはスラッシュコマンドで実行します。たとえば `/learning-note` は日英の学習ノートを作成・更新します。詳しくは[手順](.claude/skills/learning-note/SKILL_jp.md)（[English](.claude/skills/learning-note/SKILL.md)）を参照してください。

## 検証

- 必要環境: Python 3.9 以降と Git
- ドキュメントの言語の組とリンクを確認します。

  ```bash
  python3 scripts/check_docs.py
  ```

  期待する結果: `check_docs: OK` と表示され、終了コードは 0 です。問題があれば一覧が表示され、終了コードは 1 になります。
- PRの前には、変更したドキュメントの対になる言語版も変更されているか確認します。

  ```bash
  python3 scripts/check_docs.py --base origin/main
  ```

- GitHub Actions は、push と PR のたびに同じ検証を実行します（`.github/workflows/checks.yml`）。BLOCKWAVE のテスト・ビルドは `projects/blockwave/` かワークフローファイルが変更されたときだけ実行し、それ以外ではそのジョブをスキップします。

## AI 学習ガイド

- ローカル LLM の推論環境: [英語版](learning/ai/local_llm_environment.md)（[日本語版](learning/ai/local_llm_environment_jp.md)）— GPU・VRAM・帯域、RTX・DGX の具体例、推論エンジン、オープンウェイトモデル、導入例を解説します。
- [AIエージェントのアーキテクチャ](learning/ai/agent_architecture_jp.md)（[英語](learning/ai/agent_architecture.md)）— 全体像の図から、各コンポーネントの実行環境・入出力・カスタマイズ機能へ進みます。図は本文内のMermaidで記述しています。

## プロジェクト

- [BLOCKWAVE](projects/blockwave/README_jp.md)（[English](projects/blockwave/README.md)）— 共通エンジン、タッチ操作、自動テストを備えた、ブラウザとターミナルで遊べるTypeScriptの落ち物パズルゲームです。
