# Redmine連携機能 設計書

このドキュメントは、MCPサーバーに実装されているRedmine連携機能の設計を定義するものです。

## 1. 目的

Clineを通じて、自然言語でRedmineのチケットを効率的に操作できるようにすることを目的とします。

## 2. 提供ツール一覧

ユーザーに提供するツール（機能）は以下の通りです。

-   **`redmine_get_issues`**: チケットの一覧を取得する
    -   **説明**: Redmineのチケットを取得します。
    -   **パラメータ**:
        -   `assigned_to_me` (boolean, オプション): `true`にすると、担当者が自分自身のチケットのみを取得します。
        -   `subject` (string, オプション): 指定した文字列を件名に含むチケットを検索します。

-   **`redmine_create_issue`**: 新しいチケットを作成する
    -   **説明**: Redmineに新しいチケットを作成します。
    -   **パラメータ**:
        -   `project_id` (number, 必須): チケットを作成するプロジェクトのID
        -   `subject` (string, 必須): チケットの件名
        -   `description` (string, オプション): チケットの説明
        -   `assigned_to_id` (number, オプション): 担当者のユーザーID

-   **`redmine_add_comment`**: チケットにコメントを追加する
    -   **説明**: 既存のRedmineチケットにコメントを追加します。
    -   **パラメータ**:
        -   `issue_id` (number, 必須): コメントを追加するチケットのID
        -   `notes` (string, 必須): コメントの内容

## 3. 実装方針

本サーバーの共通アーキテクチャに基づき、以下の通り実装されています。

-   **APIクライアント (`src/lib/api/redmine.ts`)**:
    -   `ApiClient`クラスを継承して`RedmineClient`を作成します。
    -   環境変数 `REDMINE_URL` で指定されたRedmineサーバーをベースURLとして設定します。
    -   上記ツールに対応する各メソッド (`getIssues`, `createIssue`, `addComment`) を実装しています。
-   **ツール定義 (`src/tools/redmine.ts`)**:
    -   Clineに公開するツール定義を記述しています。
    -   ツールの`execute`関数内で`credentialManager`を利用し、ユーザーごとの認証情報（Redmine APIキー）を動的に取得・管理します。
    -   APIキーが未設定の場合は、Elicitation機能でユーザーに入力を促します。

## 4. 認証

-   認証にはRedmineの**APIアクセスキー**を使用します。
-   APIキーは`.env`ファイルには保存せず、ツール実行時にClineのセキュアな入力UIを通じてユーザーから提供を受け、セッション内でのみ安全に管理します。これにより、ユーザー自身の権限でセキュアな操作を実現します。
