type Service = 'redmine' | 'github' | 'slack';

interface Credentials {
  redmine?: string;
  github?: string;
  slack?: string;
}

class CredentialManager {
  // sessionIdをキーとして、認証情報を保持するMap
  private sessionCredentials = new Map<string, Credentials>();

  public getApiKey(sessionId: string, service: Service): string | undefined {
    const credentials = this.sessionCredentials.get(sessionId);
    if (!credentials) {
      return undefined;
    }
    return credentials[service];
  }

  public setApiKey(sessionId: string, service: Service, apiKey: string): void {
    const credentials = this.sessionCredentials.get(sessionId) || {};
    credentials[service] = apiKey;
    this.sessionCredentials.set(sessionId, credentials);
  }
}

// シングルトンインスタンスをエクスポート
export const credentialManager = new CredentialManager();
