# Slack連携機能 設計書

このドキュメントは、MCPサーバーに実装するSlack連携機能の設計を定義するものです。

## 1. 目的

Clineを通じて、自然言語でSlackの基本的な操作（メッセージの投稿・閲覧）を可能にすることを目的とします。

## 2. 提供ツール一覧

ユーザーに提供するツール（機能）は以下の通りです。

-   **`slack_post_message`**: メッセージを投稿する
    -   **説明**: 指定されたチャンネルやユーザーにメッセージを送信します。
    -   **パラメータ**:
        -   `channel` (string, 必須): チャンネルID (例: `C01234567`) またはチャンネル名 (例: `#general`)
        -   `text` (string, 必須): 投稿するメッセージ本文
    -   **必要なOAuthスコープ**: `chat:write`

-   **`slack_get_channel_list`**: チャンネル一覧を取得する
    -   **説明**: 参加しているパブリック・プライベートチャンネルの一覧を取得します。
    -   **パラメータ**:
        -   `limit` (number, オプション, default: 100): 取得するチャンネル数の上限
    -   **必要なOAuthスコープ**: `channels:read`, `groups:read`

-   **`slack_get_conversation_history`**: メッセージ履歴を取得する
    -   **説明**: 指定したチャンネルの最新のメッセージ履歴を取得します。
    -   **パラメータ**:
        -   `channel` (string, 必須): チャンネルID (例: `C01234567`)
        -   `limit` (number, オプション, default: 100): 取得するメッセージ数の上限
    -   **必要なOAuthスコープ**: `channels:history`, `groups:history`, `im:history`, `mpim:history`

## 3. 実装方針

既存のアーキテクチャを踏襲し、以下の通り実装します。

-   **APIクライアント (`src/lib/api/slack.ts`)**:
    -   `ApiClient`クラスを継承して`SlackClient`を作成します。
    -   Slack APIのエンドポイント (`https://slack.com/api/`) をベースURLとして設定します。
    -   上記ツールに対応する各メソッド (`postMessage`, `getChannelList`, `getConversationHistory`) を実装します。
-   **ツール定義 (`src/tools/slack.ts`)**:
    -   Clineに公開するツール定義を記述します。
    -   ツールの`execute`関数内で`credentialManager`を利用し、ユーザーごとの認証情報（Slack Bot User OAuth Token）を動的に取得・管理します。
    -   APIキーが未設定の場合は、Elicitation機能でユーザーに入力を促します。

## 4. 認証

-   認証には、Slackアプリの**Bot User OAuth Token** (`xoxb-`で始まるトークン) を使用します。
-   ユーザーは事前にSlackアプリを作成し、利用したいツールに応じて上記の「必要なOAuthスコープ」をアプリに付与しておく必要があります。
-   トークンは`.env`ファイルには保存せず、ツール実行時にClineのセキュアな入力UIを通じてユーザーから提供を受け、セッション内でのみ安全に管理します。
