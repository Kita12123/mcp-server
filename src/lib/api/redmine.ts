import { ApiClient } from '../core/apiClient.js';

// Redmine APIの型定義 (必要に応じて拡張)
export interface RedmineIssue {
  id: number;
  subject: string;
  description: string;
  project: { id: number; name: string };
  tracker: { id: number; name: string };
  status: { id: number; name: string };
  priority: { id: number; name: string };
  author: { id: number; name: string };
  assigned_to?: { id: number; name: string };
  created_on: string;
  updated_on: string;
}

interface GetIssuesParams {
  assigned_to_id?: 'me' | number;
  subject?: string;
  [key: string]: any;
}

export class RedmineClient extends ApiClient {
  constructor(apiKey: string) {
    const baseURL = process.env.REDMINE_URL;

    if (!baseURL) {
      throw new Error('REDMINE_URL must be set in environment variables.');
    }

    super(baseURL, {
      'X-Redmine-API-Key': apiKey,
    });
  }

  async getIssues(params: GetIssuesParams = {}): Promise<RedmineIssue[]> {
    const response = await this.get<{ issues: RedmineIssue[] }>('/issues.json', { params });
    return response.issues;
  }

  async createIssue(issue: { project_id: number; subject: string; description?: string | undefined; assigned_to_id?: number | undefined; }): Promise<RedmineIssue> {
    const response = await this.post<{ issue: RedmineIssue }>('/issues.json', { issue });
    return response.issue;
  }

  async addComment(issueId: number, notes: string): Promise<void> {
    await this.put(`/issues/${issueId}.json`, {
      issue: {
        notes,
      },
    });
  }
}

// シングルトンインスタンスは廃止
// export const redmineClient = new RedmineClient();
