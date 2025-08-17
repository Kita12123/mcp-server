import { ApiClient } from '../core/apiClient.js';

// Slack APIの型定義 (抜粋)
export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_private: boolean;
  is_member: boolean;
}

export interface SlackMessage {
  type: string;
  user: string;
  text: string;
  ts: string; // timestamp
}

interface PostMessageParams {
  channel: string;
  text: string;
}

interface GetChannelListParams {
  limit?: number;
  types?: string; // 'public_channel,private_channel'
}

interface GetHistoryParams {
  channel: string;
  limit?: number;
}

export class SlackClient extends ApiClient {
  constructor(apiKey: string) {
    // Slack APIはGETリクエストでもAuthヘッダーを要求するが、
    // POSTではapplication/jsonではなくx-www-form-urlencodedを主に使う。
    // ApiClientはJSONを前提としているため、ここではヘッダーのみ設定し、
    // 各メソッドでContent-Typeを適切に扱う。
    // ただし、SDKの作法に従い、ここではPOSTもJSONで送る。
    // Slack APIはJSONボディも受け付けてくれる。
    super('https://slack.com/api/', {
      Authorization: `Bearer ${apiKey}`,
    });
  }

  async postMessage(params: PostMessageParams): Promise<any> {
    return this.post('chat.postMessage', params);
  }

  async getChannelList(params: GetChannelListParams = {}): Promise<SlackChannel[]> {
    const response = await this.get<{ channels: SlackChannel[] }>('conversations.list', {
      params: {
        ...params,
        types: params.types || 'public_channel,private_channel',
      }
    });
    return response.channels;
  }

  async getConversationHistory(params: GetHistoryParams): Promise<SlackMessage[]> {
    const response = await this.get<{ messages: SlackMessage[] }>('conversations.history', { params });
    return response.messages;
  }
}
