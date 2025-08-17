import { z } from 'zod';
import { GitClient } from '../lib/cmd/git.js';

const gitClient = new GitClient();

const statusTool = {
  name: 'git_status',
  description: 'ワークツリーの変更状態を取得します (git status --porcelain)。',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const status = await gitClient.status();
      if (!status) {
        return { message: '変更されたファイルはありません。' };
      }
      return { status };
    } catch (error: any) {
      return { error: `git status エラー: ${error.message}` };
    }
  },
};

const addTool = {
  name: 'git_add',
  description: 'ファイルをステージングエリアに追加します (git add)。',
  inputSchema: z.object({
    files: z.array(z.string()).describe('ステージングするファイルパスの配列。["."]で全てを追加します。'),
  }),
  execute: async (input: { files: string[] }) => {
    try {
      const result = await gitClient.add(input.files);
      return { message: 'ファイルがステージングされました。', output: result };
    } catch (error: any) {
      return { error: `git add エラー: ${error.message}` };
    }
  },
};

const commitTool = {
  name: 'git_commit',
  description: 'ステージングされた変更をコミットします (git commit)。',
  inputSchema: z.object({
    message: z.string().describe('コミットメッセージ'),
  }),
  execute: async (input: { message: string }) => {
    try {
      const result = await gitClient.commit(input.message);
      return { message: 'コミットが成功しました。', output: result };
    } catch (error: any) {
      return { error: `git commit エラー: ${error.message}` };
    }
  },
};

const pullTool = {
  name: 'git_pull',
  description: 'リモートリポジトリから最新の変更を取得します (git pull)。',
  inputSchema: z.object({
    remote: z.string().optional().default('origin').describe('リモート名'),
    branch: z.string().optional().describe('プルするブランチ名'),
  }),
  execute: async (input: { remote?: string; branch?: string }) => {
    try {
      const result = await gitClient.pull(input.remote, input.branch);
      return { message: 'プルが成功しました。', output: result };
    } catch (error: any) {
      return { error: `git pull エラー: ${error.message}` };
    }
  },
};

const pushTool = {
  name: 'git_push',
  description: 'ローカルのコミットをリモートリポジトリにプッシュします (git push)。',
  inputSchema: z.object({
    remote: z.string().optional().default('origin').describe('リモート名'),
    branch: z.string().optional().describe('プッシュするブランチ名'),
  }),
  execute: async (input: { remote?: string; branch?: string }) => {
    try {
      const result = await gitClient.push(input.remote, input.branch);
      return { message: 'プッシュが成功しました。', output: result };
    } catch (error: any) {
      return { error: `git push エラー: ${error.message}` };
    }
  },
};

const logTool = {
  name: 'git_log',
  description: 'コミット履歴を取得します (git log)。',
  inputSchema: z.object({
    count: z.number().optional().default(10).describe('取得するコミット数'),
  }),
  execute: async (input: { count?: number }) => {
    try {
      const log = await gitClient.log(input.count);
      return { log };
    } catch (error: any) {
      return { error: `git log エラー: ${error.message}` };
    }
  },
};

export const gitTools = [
  statusTool,
  addTool,
  commitTool,
  pullTool,
  pushTool,
  logTool,
];
