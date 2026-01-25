export interface GitRepository {
  isGitRepository(): Promise<boolean>;
  hasStagedChanges(): Promise<boolean>;
  commit(message: string): Promise<void>;
  getLastCommitMessage(): Promise<string>;
}
