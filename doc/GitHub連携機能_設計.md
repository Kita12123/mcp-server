# GitHub連携機能 設計書

このドキュメントは、MCPサーバーに実装するGitHub連携機能の設計を定義するものです。

## 1. 目的

Clineを通じて、自然言語でGitHubのIssueやPull Requestを効率的に操作できるようにすることを目的とします。

## 2. 提供ツール一覧

ユーザーに提供するツール（機能）は以下の通りです。

### Issue関連

-   **`github_get_issues`**: Issueの一覧を取得する
    -   **パラメータ**:
        -   `owner` (string, 必須): リポジトリの所有者
        -   `repo` (string, 必須): リポジトリ名
        -   `assignee` (string, オプション): 担当者のGitHubユーザー名
        -   `labels` (string, オプション): ラベル名（カンマ区切りで複数指定可）
        -   `state` (string, オプション, default: 'open'): 状態 ('open', 'closed', 'all')
-   **`github_create_issue`**: 新しいIssueを作成する
    -   **パラメータ**:
        -   `owner` (string, 必須): リポジトリの所有者
        -   `repo` (string, 必須): リポジトリ名
        -   `title` (string, 必須): Issueのタイトル
        -   `body` (string, オプション): Issueの本文
        -   `assignees` (string, オプション): 担当者名の配列 (例: `["user1", "user2"]`)
        -   `labels` (string, オプション): ラベル名の配列 (例: `["bug", "enhancement"]`)
-   **`github_add_comment`**: Issueにコメントを追加する
    -   **パラメータ**:
        -   `owner` (string, 必須): リポジトリの所有者
        -   `repo` (string, 必須): リポジトリ名
        -   `issue_number` (number, 必須): Issue番号
        -   `body` (string, 必須): コメント本文

### Pull Request関連

-   **`github_get_pull_requests`**: Pull Requestの一覧を取得する
    -   **パラメータ**:
        -   `owner` (string, 必須): リポジトリの所有者
        -   `repo` (string, 必須): リポジトリ名
        -   `state` (string, オプション, default: 'open'): 状態 ('open', 'closed', 'all')
-   **`github_create_pull_request`**: 新しいPull Requestを作成する
    -   **パラメータ**:
        -   `owner` (string, 必須): リポジトリの所有者
        -   `repo` (string, 必須): リポジトリ名
        -   `title` (string, 必須): Pull Requestのタイトル
        -   `body` (string, オプション): Pull Requestの本文
        -   `head` (string, 必須): マージ元のブランチ名
        -   `base` (string, 必須): マージ先のブランチ名
-   **`github_merge_pull_request`**: Pull Requestをマージする
    -   **パラメータ**:
        -   `owner` (string, 必須): リポジトリの所有者
        -   `repo` (string, 必須): リポジトリ名
        -   `pull_number` (number, 必須): Pull Request番号
        -   `merge_method` (string, オプション, default: 'merge'): マージ方法 ('merge', 'squash', 'rebase')

## 3. 実装方針

既存のRedmine連携のアーキテクチャを踏襲し、以下の通り実装します。

-   **APIクライアント (`src/lib/api/github.ts`)**:
    -   `ApiClient`クラスを継承して`GitHubClient`を作成します。
    -   GitHub APIのエンドポイント (`https://api.github.com`) をベースURLとして設定します。
    -   上記ツールに対応する各メソッドを実装し、APIとの通信ロジックをカプセル化します。
-   **ツール定義 (`src/tools/github.ts`)**:
    -   Clineに公開するツール定義を記述します。
    -   ツールの`execute`関数内で`credentialManager`を利用し、ユーザーごとの認証情報（GitHub PAT）を動的に取得・管理します。
    -   APIキーが未設定の場合は、Elicitation機能でユーザーに入力を促します。

## 4. 認証

-   認証にはGitHubの**Personal Access Token (PAT)** を使用します。
-   APIキーは`.env`ファイルには保存せず、ツール実行時にユーザーから都度提供を受け、セッション内でのみ安全に管理します。これにより、ユーザー自身の権限でセキュアな操作を実現します。
