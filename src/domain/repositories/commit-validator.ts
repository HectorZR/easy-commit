import type { Commit } from '../entities/commit';
import type { ValidationResult } from '../types';

export interface CommitValidator {
  validate(commit: Commit): Promise<ValidationResult>;
}
