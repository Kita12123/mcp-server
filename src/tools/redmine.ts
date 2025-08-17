import { z } from 'zod';
import { RedmineClient } from '../lib/api/redmine.js';
import { credentialManager } from '../lib/core/credentialManager.js';

// Elicitationを使ってAPIキーを取得または要求するヘルパー関数
// TODO: SDKから正しい型がエクスポートされたらanyを修正する
async function getAuthenticatedRedmineClient(context: any): Promise<RedmineClient> {
  const { sessionId, elicitInput } = context;
  if (!sessionId) {
    throw new Error('Session ID is not available.');
  }

  let apiKey = credentialManager.getApiKey(sessionId, 'redmine');

  if (!apiKey) {
    const response = await elicitInput({
      requestedSchema: z.object({
        apiKey: z.string(),
      }),
      label: 'Redmine APIキーを入力してください。',
    });

    if (response.action === 'cancel') {
      throw new Error('APIキーの入力をキャンセルしました。');
    }
    
    apiKey = (response.content as { apiKey: string }).apiKey;
    credentialManager.setApiKey(sessionId, 'redmine', apiKey);
  }

  // この時点でapiKeyは必ずstring型になっているはず
  if (!apiKey) {
    throw new Error('APIキーの取得に失敗しました。');
  }

  return new RedmineClient(apiKey);
}


const getIssuesInput = z.object({
  assigned_to_me: z.boolean().optional().describe('trueにすると、担当者が自分自身のチケットのみを取得します。'),
  subject: z.string().optional().describe('指定した文字列を件名に含むチケットを検索します。'),
});

const getIssuesTool = {
  name: 'redmine_get_issues',
  description: 'Redmineのチケットを取得します。',
  inputSchema: getIssuesInput,
  execute: async (input: z.infer<typeof getIssuesInput>, context: any) => {
    try {
      const redmineClient = await getAuthenticatedRedmineClient(context);
      const params: { assigned_to_id?: 'me'; subject?: string } = {};

      if (input.assigned_to_me) {
        params.assigned_to_id = 'me';
      }
      if (input.subject) {
        params.subject = `~${input.subject}~`;
      }

      const issues = await redmineClient.getIssues(params);
      if (issues.length === 0) {
        return { message: '該当するチケットは見つかりませんでした。' };
      }
      const formattedIssues = issues.map(issue => ({
        ID: issue.id,
        Project: issue.project.name,
        Tracker: issue.tracker.name,
        Status: issue.status.name,
        Priority: issue.priority.name,
        Subject: issue.subject,
        AssignedTo: issue.assigned_to?.name || '未割り当て',
        Updated: issue.updated_on,
      }));
      return { issues: formattedIssues };
    } catch (error: any) {
      return { error: `チケット取得エラー: ${error.message}` };
    }
  },
};

const createIssueInput = z.object({
  project_id: z.number().describe('チケットを作成するプロジェクトのID'),
  subject: z.string().describe('チケットの件名'),
  description: z.string().optional().describe('チケットの説明'),
  assigned_to_id: z.number().optional().describe('担当者のユーザーID'),
});

const createIssueTool = {
  name: 'redmine_create_issue',
  description: 'Redmineに新しいチケットを作成します。',
  inputSchema: createIssueInput,
  execute: async (input: z.infer<typeof createIssueInput>, context: any) => {
    try {
      const redmineClient = await getAuthenticatedRedmineClient(context);
      const issue = await redmineClient.createIssue(input);
      return { message: `チケット #${issue.id} を作成しました。`, issue };
    } catch (error: any) {
      return { error: `チケット作成エラー: ${error.message}` };
    }
  },
};

const addCommentInput = z.object({
  issue_id: z.number().describe('コメントを追加するチケットのID'),
  notes: z.string().describe('コメントの内容'),
});

const addCommentTool = {
  name: 'redmine_add_comment',
  description: '既存のRedmineチケットにコメントを追加します。',
  inputSchema: addCommentInput,
  execute: async (input: z.infer<typeof addCommentInput>, context: any) => {
    try {
      const redmineClient = await getAuthenticatedRedmineClient(context);
      await redmineClient.addComment(input.issue_id, input.notes);
      return { message: `チケット #${input.issue_id} にコメントを追加しました。` };
    } catch (error: any) {
      return { error: `コメント追加エラー: ${error.message}` };
    }
  },
};

export const redmineTools = [
  getIssuesTool,
  createIssueTool,
  addCommentTool,
];
