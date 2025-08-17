import 'dotenv/config'; // .envファイルを読み込む
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "fs";
import { redmineTools } from './tools/redmine.js';
import { githubTools } from './tools/github.js';
import { slackTools } from './tools/slack.js';
import { gitTools } from './tools/git.js';

// package.jsonからサーバー情報を読み込む
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

const server = new McpServer({
  name: pkg.name,
  version: pkg.version,
  tools: [
    ...redmineTools,
    ...githubTools,
    ...slackTools,
    ...gitTools,
    // 他のツールもここに追加していく
  ],
});

// Stdioでサーバーを起動
const transport = new StdioServerTransport();
server.connect(transport).catch(err => {
  console.error("Failed to connect to transport", err);
  process.exit(1);
});
