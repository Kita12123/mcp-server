import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class CmdClient {
  protected async runCommand(command: string): Promise<string> {
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
}
