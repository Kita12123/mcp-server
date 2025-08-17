import { z } from 'zod';
import { GitHubClient } from '../lib/api/github.js';
import { credentialManager } from '../lib/core/credentialManager.js';

// Elicitationを使ってAPIキーを取得または要求するヘルパー関数
async function getAuthenticatedGitHubClient(context: any): Promise<GitHubClient> {
  const { sessionId, elicitInput } = context;
  if (!sessionId) {
    throw new Error('Session ID is not available.');
  }

  let apiKey = credentialManager.getApiKey(sessionId, 'github');

  if (!apiKey) {
    const response = await elicitInput({
      requestedSchema: z.object({
        apiKey: z.string(),
      }),
      label: 'GitHub Personal Access Token (PAT) を入力してください。',
      instructions: 'リポジトリの読み取りと書き込み権限を持つPATが必要です。',
    });

    if (response.action === 'cancel') {
      throw new Error('APIキーの入力をキャンセルしました。');
    }
    
    apiKey = (response.content as { apiKey: string }).apiKey;
    credentialManager.setApiKey(sessionId, 'github', apiKey);
  }

  if (!apiKey) {
    throw new Error('APIキーの取得に失敗しました。');
  }

  return new GitHubClient(apiKey);
}

// --- Issue Tools ---

const getIssuesTool = {
  name: 'github_get_issues',
  description: 'GitHubリポジトリのIssueを取得します。',
  inputSchema: z.object({
    owner: z.string().describe('リポジトリの所有者'),
    repo: z.string().describe('リポジトリ名'),
    assignee: z.string().optional().describe('担当者のGitHubユーザー名'),
    labels: z.string().optional().describe('ラベル名（カンマ区切りで複数指定可）'),
    state: z.enum(['open', 'closed', 'all']).optional().default('open').describe("Issueの状態"),
  }),
  execute: async (input: any, context: any) => {
    try {
      const githubClient = await getAuthenticatedGitHubClient(context);
      const issues = await githubClient.getIssues(input.owner, input.repo, {
        assignee: input.assignee,
        labels: input.labels,
        state: input.state,
      });
      if (issues.length === 0) {
        return { message: '該当するIssueは見つかりませんでした。' };
      }
      return issues.map(issue => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        author: issue.user.login,
        url: issue.html_url,
      }));
    } catch (error: any) {
      return { error: `Issue取得エラー: ${error.message}` };
    }
  },
};

const createIssueTool = {
  name: 'github_create_issue',
  description: 'GitHubリポジトリに新しいIssueを作成します。',
  inputSchema: z.object({
    owner: z.string().describe('リポジトリの所有者'),
    repo: z.string().describe('リポジトリ名'),
    title: z.string().describe('Issueのタイトル'),
    body: z.string().optional().describe('Issueの本文'),
    assignees: z.array(z.string()).optional().describe('担当者名の配列'),
    labels: z.array(z.string()).optional().describe('ラベル名の配列'),
  }),
  execute: async (input: any, context: any) => {
    try {
      const githubClient = await getAuthenticatedGitHubClient(context);
      const issue = await githubClient.createIssue(input.owner, input.repo, input);
      return { message: `Issue #${issue.number} を作成しました。`, url: issue.html_url };
    } catch (error: any) {
      return { error: `Issue作成エラー: ${error.message}` };
    }
  },
};

const addCommentTool = {
  name: 'github_add_comment',
  description: '既存のGitHub Issueにコメントを追加します。',
  inputSchema: z.object({
    owner: z.string().describe('リポジトリの所有者'),
    repo: z.string().describe('リポジトリ名'),
    issue_number: z.number().describe('Issue番号'),
    body: z.string().describe('コメント本文'),
  }),
  execute: async (input: any, context: any) => {
    try {
      const githubClient = await getAuthenticatedGitHubClient(context);
      await githubClient.addComment(input.owner, input.repo, input.issue_number, { body: input.body });
      return { message: `Issue #${input.issue_number} にコメントを追加しました。` };
    } catch (error: any) {
      return { error: `コメント追加エラー: ${error.message}` };
    }
  },
};

// --- Pull Request Tools ---

const getPullRequestsTool = {
  name: 'github_get_pull_requests',
  description: 'GitHubリポジトリのPull Requestを取得します。',
  inputSchema: z.object({
    owner: z.string().describe('リポジトリの所有者'),
    repo: z.string().describe('リポジトリ名'),
    state: z.enum(['open', 'closed', 'all']).optional().default('open').describe("Pull Requestの状態"),
  }),
  execute: async (input: any, context: any) => {
    try {
      const githubClient = await getAuthenticatedGitHubClient(context);
      const prs = await githubClient.getPullRequests(input.owner, input.repo, { state: input.state });
      if (prs.length === 0) {
        return { message: '該当するPull Requestは見つかりませんでした。' };
      }
      return prs.map(pr => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        author: pr.user.login,
        url: pr.html_url,
      }));
    } catch (error: any) {
      return { error: `Pull Request取得エラー: ${error.message}` };
    }
  },
};

const createPullRequestTool = {
  name: 'github_create_pull_request',
  description: 'GitHubリポジトリに新しいPull Requestを作成します。',
  inputSchema: z.object({
    owner: z.string().describe('リポジトリの所有者'),
    repo: z.string().describe('リポジトリ名'),
    title: z.string().describe('Pull Requestのタイトル'),
    head: z.string().describe('マージ元のブランチ名'),
    base: z.string().describe('マージ先のブランチ名'),
    body: z.string().optional().describe('Pull Requestの本文'),
  }),
  execute: async (input: any, context: any) => {
    try {
      const githubClient = await getAuthenticatedGitHubClient(context);
      const pr = await githubClient.createPullRequest(input.owner, input.repo, input);
      return { message: `Pull Request #${pr.number} を作成しました。`, url: pr.html_url };
    } catch (error: any) {
      return { error: `Pull Request作成エラー: ${error.message}` };
    }
  },
};

const mergePullRequestTool = {
  name: 'github_merge_pull_request',
  description: 'GitHubリポジトリのPull Requestをマージします。',
  inputSchema: z.object({
    owner: z.string().describe('リポジトリの所有者'),
    repo: z.string().describe('リポジトリ名'),
    pull_number: z.number().describe('Pull Request番号'),
    merge_method: z.enum(['merge', 'squash', 'rebase']).optional().default('merge').describe('マージ方法'),
  }),
  execute: async (input: any, context: any) => {
    try {
      const githubClient = await getAuthenticatedGitHubClient(context);
      await githubClient.mergePullRequest(input.owner, input.repo, input.pull_number, { merge_method: input.merge_method });
      return { message: `Pull Request #${input.pull_number} をマージしました。` };
    } catch (error: any) {
      return { error: `Pull Requestのマージエラー: ${error.message}` };
    }
  },
};

export const githubTools = [
  getIssuesTool,
  createIssueTool,
  addCommentTool,
  getPullRequestsTool,
  createPullRequestTool,
  mergePullRequestTool,
];
