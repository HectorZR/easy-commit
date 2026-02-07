import type { Commit } from '../../domain/entities/commit';
import { isValidCommitType } from '../../domain/entities/commit-type';
import type { CommitValidator } from '../../domain/repositories/commit-validator';
import type { ValidationResult } from '../../domain/types';
import type { Config } from '../../infrastructure/config/config-loader';

type ValidationRule = (commit: Commit) => Promise<string | null>;

/**
 * Concurrent validator that runs multiple validation rules in parallel
 * using Promise.all for efficient async validation
 */
export class ConcurrentValidator implements CommitValidator {
  private rules: ValidationRule[] = [];

  /**
   * Add a validation rule to the validator
   */
  addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Validate a commit by running all rules concurrently
   * Returns aggregated validation result with all errors
   */
  async validate(commit: Commit): Promise<ValidationResult> {
    // Use Promise.all for concurrent validation
    // This is simpler than Go's worker pools but equally efficient for I/O
    const results = await Promise.all(this.rules.map((rule) => rule(commit)));

    // Filter out null results (successful validations)
    const errors = results.filter((err): err is string => err !== null);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get the number of registered validation rules
   */
  getRuleCount(): number {
    return this.rules.length;
  }
}

/**
 * Create a validator with all default validation rules
 */
export function createDefaultValidator(config: Config): ConcurrentValidator {
  const validator = new ConcurrentValidator();

  // Rule: Description not empty
  validator.addRule(async (commit) => {
    if (!commit.description || commit.description.trim().length === 0) {
      return 'Description cannot be empty';
    }
    return null;
  });

  // Rule: Description length
  validator.addRule(async (commit) => {
    if (commit.description.length > config.commit.maxDescriptionLength) {
      return `Description too long (${commit.description.length}/${config.commit.maxDescriptionLength})`;
    }
    return null;
  });

  // Rule: Body length (if body exists)
  validator.addRule(async (commit) => {
    if (commit.body && commit.body.length > config.commit.maxBodyLength) {
      return `Body too long (${commit.body.length}/${config.commit.maxBodyLength})`;
    }
    return null;
  });

  // Rule: Valid commit type
  validator.addRule(async (commit) => {
    if (!isValidCommitType(commit.type)) {
      return `Invalid commit type: ${commit.type}`;
    }
    return null;
  });

  // Rule: Scope format (if provided)
  validator.addRule(async (commit) => {
    if (commit.scope && !/^[a-z0-9-]+$/.test(commit.scope)) {
      return `Invalid scope format: ${commit.scope}. Must be lowercase letters, numbers, and hyphens only`;
    }
    return null;
  });

  // Rule: Scope length (if provided)
  validator.addRule(async (commit) => {
    if (commit.scope && commit.scope.length > 30) {
      return `Scope too long (${commit.scope.length}/30)`;
    }
    return null;
  });

  // Rule: Invalid characters in description
  validator.addRule(async (commit) => {
    for (const char of config.commit.invalidChars) {
      if (commit.description.includes(char)) {
        return `Description contains invalid character: '${char}'`;
      }
    }
    return null;
  });

  // Rule: Description should start with lowercase (Conventional Commits)
  validator.addRule(async (commit) => {
    const firstChar = commit.description[0];
    if (firstChar && firstChar !== firstChar.toLowerCase()) {
      return 'Description should start with lowercase letter';
    }
    return null;
  });

  return validator;
}
