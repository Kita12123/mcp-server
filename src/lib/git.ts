import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GitClient {
  private async runCommand(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        // stderrに何か出力されても必ずしもエラーとは限らないため、stdoutを返す
        // (例: git pull時の進捗表示など)
        return stdout.trim() || stderr.trim();
      }
      return stdout.trim();
    } catch (error: any) {
      // コマンド実行自体が失敗した場合
      console.error(`Error executing command: ${command}`, error);
      throw new Error(error.stderr || error.stdout || error.message);
    }
  }

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
}
