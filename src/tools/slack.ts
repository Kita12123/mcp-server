import { z } from 'zod';
import { SlackClient } from '../lib/api/slack.js';
import { credentialManager } from '../lib/core/credentialManager.js';

// Elicitationを使ってAPIキーを取得または要求するヘルパー関数
async function getAuthenticatedSlackClient(context: any): Promise<SlackClient> {
  const { sessionId, elicitInput } = context;
  if (!sessionId) {
    throw new Error('Session ID is not available.');
  }

  let apiKey = credentialManager.getApiKey(sessionId, 'slack');

  if (!apiKey) {
    const response = await elicitInput({
      requestedSchema: z.object({
        apiKey: z.string(),
      }),
      label: 'Slack Bot User OAuth Token を入力してください。',
      instructions: 'xoxb- で始まるトークンを入力してください。必要な権限が付与されている必要があります。',
    });

    if (response.action === 'cancel') {
      throw new Error('APIキーの入力をキャンセルしました。');
    }
    
    apiKey = (response.content as { apiKey: string }).apiKey;
    credentialManager.setApiKey(sessionId, 'slack', apiKey);
  }

  if (!apiKey) {
    throw new Error('APIキーの取得に失敗しました。');
  }

  return new SlackClient(apiKey);
}

const postMessageTool = {
  name: 'slack_post_message',
  description: 'Slackチャンネルにメッセージを投稿します。',
  inputSchema: z.object({
    channel: z.string().describe('チャンネルID (例: C01234567) またはチャンネル名 (例: #general)'),
    text: z.string().describe('投稿するメッセージ本文'),
  }),
  execute: async (input: any, context: any) => {
    try {
      const slackClient = await getAuthenticatedSlackClient(context);
      const result = await slackClient.postMessage(input);
      if (result.ok) {
        return { message: `チャンネル ${input.channel} にメッセージを投稿しました。` };
      } else {
        return { error: `メッセージの投稿に失敗しました: ${result.error}` };
      }
    } catch (error: any) {
      return { error: `メッセージ投稿エラー: ${error.message}` };
    }
  },
};

const getChannelListTool = {
  name: 'slack_get_channel_list',
  description: '参加しているSlackチャンネルの一覧を取得します。',
  inputSchema: z.object({
    limit: z.number().optional().default(100).describe('取得するチャンネル数の上限'),
  }),
  execute: async (input: any, context: any) => {
    try {
      const slackClient = await getAuthenticatedSlackClient(context);
      const channels = await slackClient.getChannelList({ limit: input.limit });
      if (channels.length === 0) {
        return { message: '参加しているチャンネルは見つかりませんでした。' };
      }
      return channels.map(ch => ({ id: ch.id, name: ch.name, is_private: ch.is_private }));
    } catch (error: any) {
      return { error: `チャンネル一覧取得エラー: ${error.message}` };
    }
  },
};

const getConversationHistoryTool = {
  name: 'slack_get_conversation_history',
  description: '指定したSlackチャンネルのメッセージ履歴を取得します。',
  inputSchema: z.object({
    channel: z.string().describe('履歴を取得するチャンネルのID (例: C01234567)'),
    limit: z.number().optional().default(100).describe('取得するメッセージ数の上限'),
  }),
  execute: async (input: any, context: any) => {
    try {
      const slackClient = await getAuthenticatedSlackClient(context);
      const messages = await slackClient.getConversationHistory(input);
      if (messages.length === 0) {
        return { message: 'このチャンネルにはメッセージがありません。' };
      }
      // ユーザーIDを名前に変換する処理はここでは省略
      return messages.map(msg => ({ user: msg.user, text: msg.text, timestamp: msg.ts }));
    } catch (error: any) {
      return { error: `メッセージ履歴取得エラー: ${error.message}` };
    }
  },
};

export const slackTools = [
  postMessageTool,
  getChannelListTool,
  getConversationHistoryTool,
];
