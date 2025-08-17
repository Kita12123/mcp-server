# Cline連携設定ガイド

このドキュメントは、ローカルで開発・実行しているMCPサーバーをClineに連携させるための設定手順を説明します。

## 概要

本サーバーは、**標準入出力（stdio）**を通じてClineと通信します。
この方式では、Clineが必要に応じてサーバープロセスを起動し、標準入力でリクエストを送り、標準出力からレスポンスを受け取ります。

この連携を有効にするには、ClineのMCP設定ファイルに「サーバーを起動するためのコマンド」を登録する必要があります。

## 設定手順

1.  **ClineのMCP設定ファイルを開く**
    -   VS CodeのアクティビティバーにあるClineのアイコン（横三本線のアイコン）をクリックして、サイドバーを開きます。
    -   「MCP Servers」ビューが表示されますので、「Installed」タブを選択します。
    -   中央に表示される「Configure MCP Servers」ボタンをクリックします。
    -   `cline_mcp_settings.json` というファイルがエディタで開きます。

2.  **サーバー設定を追記する**
    -   開いた `cline_mcp_settings.json` ファイルの `mcpServers` オブジェクト内に、以下の設定を追記します。
    -   もし `mcpServers` オブジェクトが存在しない、またはファイルが空の場合は、ファイル全体を以下の内容にしてください。

    ```json
    {
      "mcpServers": {
        "local-mcp-server": {
          "type": "stdio",
          "command": "npm run start",
          "cwd": "C:/Users/path/to/your/mcp-server",
          "disabled": false,
          "autoApprove": []
        }
      }
    }
    ```

3.  **設定内容を編集する**
    -   **`"local-mcp-server"`**:
        -   サーバーを識別するための名前です。`my-dev-server`など、好きな名前に変更できます。
    -   **`"cwd"`**:
        -   **【重要】** このプロジェクトのルートディレクトリの**絶対パス**に書き換えてください。
        -   例: `C:/Users/Taro/Documents/projects/mcp-server`
        -   例: `/home/taro/projects/mcp-server`

4.  **ファイルを保存する**
    -   ファイルを保存すると、Clineが設定を自動的に再読み込みし、サーバーへの接続を開始します。
    -   VS Codeの再起動は通常不要です。

以上で設定は完了です。Clineを通じて、このサーバーで定義したツール（`redmine_get_issues`など）が利用可能になります。
