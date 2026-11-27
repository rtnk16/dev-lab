# dev-lab

[English](README.md)

学習、実験、開発のための個人用ワークスペースです。

## 内容

### AI学習ガイド

- [ローカルLLMの推論環境](learning/ai/local_llm_environment_jp.md)（[English](learning/ai/local_llm_environment.md)）— GPU・VRAM・帯域、RTX・DGXの具体例、推論エンジン、オープンウェイトモデル、導入例を解説します。
- [AIエージェントのアーキテクチャ](learning/ai/agent_architecture_jp.md)（[English](learning/ai/agent_architecture.md)）— 全体像の図から、各コンポーネントの実行環境・入出力・カスタマイズ機能へ進みます。図は本文内のMermaidで記述しています。

### 組み込み学習ガイド

- [Jetson AGX Orinのペリフェラル](learning/embedded/jetson_agx_orin_peripherals_jp.md)（[English](learning/embedded/jetson_agx_orin_peripherals.md)）— モジュールのインターフェース、Developer Kitのコネクタ、GPIO・UART・I2C・SPI・CAN・PWM・オーディオ・USB・PCIe・Ethernet・カメラ・ディスプレイ・ストレージのLinuxドライバとユーザー空間からの使い方をまとめます。
- [I2C](learning/embedded/i2c_jp.md)（[English](learning/embedded/i2c.md)）— START/STOP、アドレス指定、ACK、プルアップ、速度モード、`i2c-dev`の使い方を説明します。
- [SPI](learning/embedded/spi_jp.md)（[English](learning/embedded/spi.md)）— シフトレジスタによる転送、4つのクロックモード、チップセレクト、`spidev`の使い方を説明します。
- [UART](learning/embedded/uart_jp.md)（[English](learning/embedded/uart.md)）— フレーム形式、ボーレートの許容誤差、フロー制御、RS-232/RS-485、`termios`の使い方を説明します。
- [USB](learning/embedded/usb_jp.md)（[English](learning/embedded/usb.md)）— USB 2.0/3.x/Type-Cのピン、CCによる検出、列挙、ディスクリプタ、転送の種類、Jetsonのホスト／デバイスモードを説明します。
- [MIPI CSI-2](learning/embedded/mipi_csi_jp.md)（[English](learning/embedded/mipi_csi.md)）— カメラコネクタのピン、D-PHY/C-PHY、CSI-2のパケット、帯域、Jetsonでのカメラの立ち上げを説明します。

### プロジェクト

- [BLOCKWAVE](projects/blockwave/README_jp.md)（[English](projects/blockwave/README.md)）— 共通エンジン、タッチ操作、自動テストを備えた、ブラウザとターミナルで遊べるTypeScriptの落ち物パズルゲームです。

## リポジトリのルール

- [リポジトリのルール](CLAUDE_jp.md)（[English](CLAUDE.md)）— Claude Codeは`CLAUDE.md`（英語版）を自動で読み込みます。このリポジトリはClaude Code専用です。
- `codex`ブランチには、以前のCodex・Copilot向けの構成（`AGENTS.md`、`.github/copilot-instructions.md`、`.agents/skills/`）を保存しています。

## Claude Codeの使い方

- 共有設定は`.claude/settings.json`にあります。読み取り系のGitコマンドと検証コマンドをあらかじめ許可し、Claudeがターンを終えるときに`Stop` hookでドキュメントの検証を実行します。
- 個人用の上書き設定は`.claude/settings.local.json`か`CLAUDE.local.md`に書きます。どちらもGitの追跡対象外です。
- プロジェクトのスキルはスラッシュコマンドで実行します。たとえば`/learning-note`は日英の学習ノートを作成・更新します。詳しくは[手順](.claude/skills/learning-note/SKILL_jp.md)（[English](.claude/skills/learning-note/SKILL.md)）を参照してください。

## 検証

- 必要環境: Python 3.9以降とGit
- ドキュメントの言語の組とリンクを確認します。

  ```bash
  python3 scripts/check_docs.py
  ```

  期待する結果: `check_docs: OK`と表示され、終了コードは0です。問題があれば一覧が表示され、終了コードは1になります。
- PRの前には、変更したドキュメントの対になる言語版も変更されているか確認します。

  ```bash
  python3 scripts/check_docs.py --base origin/main
  ```

- GitHub Actionsは、pushとPRのたびに同じ検証を実行します（`.github/workflows/checks.yml`）。BLOCKWAVEのテスト・ビルドは`projects/blockwave/`かワークフローファイルが変更されたときだけ実行し、それ以外ではそのジョブをスキップします。

## ディレクトリ構成

```text
dev-lab/
├── .claude/              Claude Codeの設定とプロジェクトのスキル
├── .github/workflows/    GitHub Actionsの検証
├── learning/<topic>/     学習ノート（テーマごとに英語・日本語の組）
├── projects/<name>/      アプリケーション（それぞれREADMEの組を持つ）
├── scripts/              check_docs.pyなどのリポジトリ用ツール
├── CLAUDE.md             リポジトリのルール（日本語: CLAUDE_jp.md）
└── README.md             このファイルの英語版（日本語: README_jp.md）
```

- 命名と配置のルールは[配置と命名](CLAUDE_jp.md#配置と命名)を参照してください。
