# MCPサーバー for Redmine/GitHub

ClineからRedmineやGitHubを操作するためのMCPサーバーです。

## 概要

このプロジェクトは、自然言語を通じてRedmineのチケット操作やGitHubのIssue管理などを自動化することを目的としています。
拡張性を重視した設計になっており、将来的には他の外部サービスとの連携も容易に追加できます。

本サーバーはAWSなどのクラウド環境へのデプロイを想定しており、複数のユーザーが同時に利用できるアーキテクチャを採用しています。

## 機能一覧

現在実装されているツールは以下の通りです。

### Redmine

-   **チケット一覧取得 (`redmine_get_issues`)**: 担当者や件名でチケットを検索します。
-   **チケット作成 (`redmine_create_issue`)**: 新しいチケットを作成します。
-   **コメント追加 (`redmine_add_comment`)**: 既存のチケットにコメントを追加します。

### GitHub

-   **Issue一覧取得 (`github_get_issues`)**:担当者やラベルでIssueを検索します。
-   **Issue作成 (`github_create_issue`)**: 新しいIssueを作成します。
-   **コメント追加 (`github_add_comment`)**: 既存のIssueにコメントを追加します。
-   **Pull Request一覧取得 (`github_get_pull_requests`)**: Pull Requestを検索します。
-   **Pull Request作成 (`github_create_pull_request`)**: 新しいPull Requestを作成します。
-   **Pull Requestマージ (`github_merge_pull_request`)**: Pull Requestをマージします。

### Slack

-   **メッセージ投稿 (`slack_post_message`)**: チャンネルにメッセージを投稿します。
-   **チャンネル一覧取得 (`slack_get_channel_list`)**: 参加しているチャンネルの一覧を取得します。
-   **メッセージ履歴取得 (`slack_get_conversation_history`)**: チャンネルのメッセージ履歴を取得します。

### Git

-   **状態確認 (`git_status`)**: ワークツリーの変更状態を確認します。
-   **ステージング (`git_add`)**: ファイルをステージングエリアに追加します。
-   **コミット (`git_commit`)**: ステージングされた変更をコミットします。
-   **プル (`git_pull`)**: リモートリポジトリから最新の変更を取得します。
-   **プッシュ (`git_push`)**: ローカルのコミットをリモートリポジトリにプッシュします。

## セットアップと実行方法（ローカル開発環境）

ローカル環境で開発やテストを行う際の手順です。本番環境へのデプロイについては、[doc/アーキテクチャ.md](./doc/アーキテクチャ.md)を参照してください。

### 1. 依存ライブラリのインストール

```bash
npm install
```

### 2. 環境変数の設定

サーバーを動作させるために、RedmineのURLを設定する必要があります。
プロジェクトのルートに `.env` ファイルを作成し、`.env.example` を参考に以下の内容を記述してください。

```env
# Redmine
REDMINE_URL=https://your.redmine.jp

# (オプション) サーバーのデフォルトAPIキー
# REDMINE_API_KEY=your_redmine_api_key
# GITHUB_API_KEY=your_github_api_key
```

### 3. APIキーの設定について

このサーバーは、ユーザーごとにAPIキーを管理します。
ツールを初めて実行する際に、以下のようにAPIキーの入力を求められます。入力されたキーは安全に扱われ、プロンプト履歴には残りません。

> **Cline:** RedmineのAPIキーを入力してください。  
> **You:** (専用の入力欄にAPIキーを入力)

一度入力したキーは、セッションが継続する限りサーバーに記憶されます。

### 4. ビルドとサーバー起動

以下のコマンドで、TypeScriptをコンパイルし、サーバーを起動します。

```bash
# ビルド
npm run build

# サーバー起動
npm run start
```

## アーキテクチャ

このサーバーの設計思想やディレクトリ構造については、以下のドキュメントを参照してください。

-   [doc/アーキテクチャ.md](./doc/アーキテクチャ.md)
