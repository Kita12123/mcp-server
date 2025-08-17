import { ApiClient } from '../core/apiClient.js';

// GitHub APIの型定義 (抜粋)
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: 'open' | 'closed';
  user: { login: string };
  assignees: { login: string }[];
  labels: { name: string }[];
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: 'open' | 'closed';
  user: { login: string };
  merged: boolean;
}

// パラメータの型定義
interface GetIssuesParams {
  assignee?: string;
  labels?: string;
  state?: 'open' | 'closed' | 'all';
}

interface CreateIssueParams {
  title: string;
  body?: string;
  assignees?: string[];
  labels?: string[];
}

interface AddCommentParams {
  body: string;
}

interface GetPullRequestsParams {
  state?: 'open' | 'closed' | 'all';
}

interface CreatePullRequestParams {
  title: string;
  body?: string;
  head: string;
  base: string;
}

interface MergePullRequestParams {
  commit_title?: string;
  commit_message?: string;
  merge_method?: 'merge' | 'squash' | 'rebase';
}

export class GitHubClient extends ApiClient {
  constructor(apiKey: string) {
    super('https://api.github.com', {
      Authorization: `Bearer ${apiKey}`,
      'X-GitHub-Api-Version': '2022-11-28',
      Accept: 'application/vnd.github+json',
    });
  }

  // Issues
  async getIssues(owner: string, repo: string, params: GetIssuesParams): Promise<GitHubIssue[]> {
    return this.get(`/repos/${owner}/${repo}/issues`, { params });
  }

  async createIssue(owner: string, repo: string, issue: CreateIssueParams): Promise<GitHubIssue> {
    return this.post(`/repos/${owner}/${repo}/issues`, issue);
  }

  async addComment(owner: string, repo: string, issueNumber: number, comment: AddCommentParams): Promise<any> {
    return this.post(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, comment);
  }

  // Pull Requests
  async getPullRequests(owner: string, repo: string, params: GetPullRequestsParams): Promise<GitHubPullRequest[]> {
    return this.get(`/repos/${owner}/${repo}/pulls`, { params });
  }

  async createPullRequest(owner: string, repo: string, pr: CreatePullRequestParams): Promise<GitHubPullRequest> {
    return this.post(`/repos/${owner}/${repo}/pulls`, pr);
  }

  async mergePullRequest(owner: string, repo: string, pullNumber: number, options: MergePullRequestParams): Promise<any> {
    return this.put(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, options);
  }
}
