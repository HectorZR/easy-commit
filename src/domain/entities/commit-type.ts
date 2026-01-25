export interface CommitType {
  name: string;
  description: string;
}

export const COMMIT_TYPES: CommitType[] = [
  { name: 'feat', description: 'A new feature' },
  { name: 'fix', description: 'A bug fix' },
  { name: 'docs', description: 'Documentation only changes' },
  { name: 'style', description: 'Code style changes (formatting, semicolons, etc.)' },
  { name: 'refactor', description: 'Code refactoring (no behavior change)' },
  { name: 'test', description: 'Adding or updating tests' },
  { name: 'chore', description: 'Maintenance tasks' },
  { name: 'build', description: 'Build system changes' },
  { name: 'ci', description: 'CI configuration changes' },
  { name: 'perf', description: 'Performance improvements' },
];

export function getCommitTypeByName(name: string): CommitType | undefined {
  return COMMIT_TYPES.find((t) => t.name === name);
}

export function isValidCommitType(name: string): boolean {
  return COMMIT_TYPES.some((t) => t.name === name);
}
