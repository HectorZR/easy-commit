import type { Commit } from '../../domain/entities/commit';
import type { CommitValidator } from '../../domain/repositories/commit-validator';
import type { GitRepository } from '../../domain/repositories/git-repository';
import type { ValidationResult } from '../../domain/types';
import type { Config } from '../../infrastructure/config/config-loader';
import type { Logger } from '../../infrastructure/logger/logger';

/**
 * CommitService orchestrates the commit creation workflow
 *
 * Responsibilities:
 * - Validate git repository state
 * - Check for staged changes
 * - Validate commit content
 * - Format commit message
 * - Execute git commit command
 */
export class CommitService {
  constructor(
    private gitRepo: GitRepository,
    private validator: CommitValidator,
    private logger: Logger,
    private config: Config
  ) {}

  /**
   * Create a commit following the complete workflow:
   * 1. Verify git repository
   * 2. Verify staged changes
   * 3. Validate commit
   * 4. Format message
   * 5. Execute git commit
   */
  async createCommit(commit: Commit): Promise<void> {
    this.logger.info('Starting commit creation workflow...');

    // 1. Verify this is a git repository
    this.logger.debug('Checking if current directory is a git repository...');
    if (!(await this.gitRepo.isGitRepository())) {
      const error = 'Not a git repository. Please run this command from within a git repository.';
      this.logger.error(error);
      throw new Error(error);
    }

    // 2. Verify there are staged changes to commit
    this.logger.debug('Checking for staged changes...');
    if (!(await this.gitRepo.hasStagedChanges())) {
      const error = 'No staged changes to commit. Use "git add" to stage changes first.';
      this.logger.error(error);
      throw new Error(error);
    }

    // 3. Validate commit content
    this.logger.debug('Validating commit content...');
    const validation = await this.validator.validate(commit);
    if (!validation.valid) {
      const errorMessage = `Validation failed:\n${validation.errors.map((e) => `  - ${e}`).join('\n')}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // 4. Format commit message
    const message = commit.format();
    this.logger.debug(`Formatted commit message:\n${message}`);

    // 5. Execute git commit
    this.logger.info('Executing git commit...');
    await this.gitRepo.commit(message);

    this.logger.info('✓ Commit created successfully');
  }

  /**
   * Preview the formatted commit message without creating the commit
   */
  previewCommit(commit: Commit): string {
    this.logger.debug('Previewing commit message...');
    return commit.format();
  }

  /**
   * Validate a commit without creating it
   */
  async validateCommit(commit: Commit): Promise<ValidationResult> {
    this.logger.debug('Validating commit...');
    return await this.validator.validate(commit);
  }

  /**
   * Get the current configuration
   */
  getConfig(): Config {
    return this.config;
  }

  /**
   * Check if the current directory is a git repository
   */
  async isGitRepository(): Promise<boolean> {
    return await this.gitRepo.isGitRepository();
  }

  /**
   * Check if there are staged changes
   */
  async hasStagedChanges(): Promise<boolean> {
    return await this.gitRepo.hasStagedChanges();
  }

  /**
   * Get the last commit message
   */
  async getLastCommitMessage(): Promise<string> {
    return await this.gitRepo.getLastCommitMessage();
  }
}

// Re-export ValidationResult type for convenience
export type { ValidationResult } from '../../domain/types';
