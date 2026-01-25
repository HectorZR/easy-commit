export interface CommitType {
  name: string;
  description: string;
}

export const COMMIT_TYPES: CommitType[] = [
  { name: 'feat', description: 'A new feature' },
  { name: 'fix', description: 'A bug fix' },
  { name: 'docs', description: 'Documentation only changes' },
  { name: 'style', description: 'Code style changes' },
  { name: 'refactor', description: 'Code refactoring' },
  { name: 'test', description: 'Adding or updating tests' },
  { name: 'chore', description: 'Maintenance tasks' },
  { name: 'build', description: 'Build system changes' },
  { name: 'ci', description: 'CI configuration changes' },
  { name: 'perf', description: 'Performance improvements' },
];
