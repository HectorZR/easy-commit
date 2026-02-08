import { spawn } from 'bun';
import type { GitRepository } from '../../domain/repositories/git-repository';
import type { Logger } from '../logger/logger';

export interface GitExecutorOptions {
  /**
   * If true, git output will be piped instead of inherited.
   * This is crucial for MCP server mode to prevent stdout pollution.
   * Default: false (inherit stdout)
   */
  silent?: boolean;
}

/**
 * GitExecutor implements the GitRepository interface using Bun's spawn API
 * to execute git commands.
 */
export class GitExecutor implements GitRepository {
  constructor(
    private logger: Logger,
    private options: GitExecutorOptions = {}
  ) {}

  /**
   * Checks if the current directory is a git repository
   */
  async isGitRepository(): Promise<boolean> {
    this.logger.debug('Checking if current directory is a git repository');

    try {
      const proc = spawn(['git', 'rev-parse', '--git-dir'], {
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const exitCode = await proc.exited;
      return exitCode === 0;
    } catch (error) {
      this.logger.error('Error checking git repository:', error);
      return false;
    }
  }

  /**
   * Checks if there are staged changes in the git repository
   */
  async hasStagedChanges(): Promise<boolean> {
    this.logger.debug('Checking for staged changes');

    try {
      const proc = spawn(['git', 'diff', '--cached', '--quiet'], {
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const exitCode = await proc.exited;
      // Exit code 1 means there are changes
      // Exit code 0 means no changes
      return exitCode !== 0;
    } catch (error) {
      this.logger.error('Error checking staged changes:', error);
      return false;
    }
  }

  /**
   * Creates a git commit with the provided message
   */
  async commit(message: string): Promise<void> {
    this.logger.info('Executing git commit...');

    const stdioMode = this.options.silent ? 'pipe' : 'inherit';

    try {
      const proc = spawn(['git', 'commit', '-m', message], {
        stdout: stdioMode, // Show git output in real-time unless silent
        stderr: stdioMode,
      });

      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        // If silent, we might want to capture stderr to throw a better error
        if (this.options.silent && proc.stderr) {
           const stderr = await new Response(proc.stderr).text();
           throw new Error(`Git commit failed: ${stderr}`);
        }
        throw new Error(`Git commit failed with exit code ${exitCode}`);
      }

      this.logger.info('Git commit executed successfully');
    } catch (error) {
      this.logger.error('Error executing git commit:', error);
      throw error;
    }
  }

  /**
   * Gets the last commit message from the git log
   */
  async getLastCommitMessage(): Promise<string> {
    this.logger.debug('Getting last commit message');

    try {
      const proc = spawn(['git', 'log', '-1', '--pretty=%B'], {
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const output = await new Response(proc.stdout).text();
      return output.trim();
    } catch (error) {
      this.logger.error('Error getting last commit message:', error);
      return '';
    }
  }
}
