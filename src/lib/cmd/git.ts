import { CmdClient } from '../core/cmdClient.js';

export class GitClient extends CmdClient {
  async status(): Promise<string> {
    return this.runCommand('git status --porcelain');
  }

  async add(files: string[]): Promise<string> {
    const filePaths = files.join(' ');
    return this.runCommand(`git add ${filePaths}`);
  }

  async commit(message: string): Promise<string> {
    // メッセージ内のダブルクォートをエスケープする
    const escapedMessage = message.replace(/"/g, '\\"');
    return this.runCommand(`git commit -m "${escapedMessage}"`);
  }

  async pull(remote = 'origin', branch?: string): Promise<string> {
    let command = `git pull ${remote}`;
    if (branch) {
      command += ` ${branch}`;
    }
    return this.runCommand(command);
  }

  async push(remote = 'origin', branch?: string): Promise<string> {
    let command = `git push ${remote}`;
    if (branch) {
      command += ` ${branch}`;
    }
    return this.runCommand(command);
  }

  async log(count = 10): Promise<string> {
    const format = `"%h - %s (%cr) <%an>"`;
    return this.runCommand(`git log -n ${count} --pretty=format:${format}`);
  }
}
