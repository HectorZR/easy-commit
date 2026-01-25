import type { CommitConfig, ValidationResult } from '../types';

export class Commit {
  constructor(
    public readonly type: string,
    public readonly description: string,
    public readonly scope?: string,
    public readonly body?: string,
    public readonly breaking: boolean = false
  ) {}

  /**
   * Validates the commit against configuration rules
   */
  validate(config: CommitConfig): ValidationResult {
    const errors: string[] = [];

    // Validate description
    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description cannot be empty');
    }
    if (this.description.length > config.maxDescriptionLength) {
      errors.push(
        `Description too long (${this.description.length}/${config.maxDescriptionLength})`
      );
    }

    // Validate body
    if (this.body && this.body.length > config.maxBodyLength) {
      errors.push(`Body too long (${this.body.length}/${config.maxBodyLength})`);
    }

    // Validate invalid characters
    for (const char of config.invalidChars) {
      if (this.description.includes(char)) {
        errors.push(`Description contains invalid character: '${char}'`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formats the commit message according to Conventional Commits spec
   */
  format(): string {
    const parts: string[] = [];

    // Header: type(scope): description
    const scopePart = this.scope ? `(${this.scope})` : '';
    const header = `${this.type}${scopePart}: ${this.description}`;
    parts.push(header);

    // Body (with blank line)
    if (this.body) {
      parts.push('');
      parts.push(this.wrapBody(this.body));
    }

    // Footer: Breaking change
    if (this.breaking) {
      parts.push('');
      parts.push('BREAKING CHANGE: This commit introduces breaking changes');
    }

    return parts.join('\n');
  }

  /**
   * Wraps body text at 72 characters
   */
  private wrapBody(text: string): string {
    const maxWidth = 72;
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines.join('\n');
  }

  isBreaking(): boolean {
    return this.breaking;
  }

  hasScope(): boolean {
    return !!this.scope;
  }
}
