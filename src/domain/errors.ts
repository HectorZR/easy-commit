export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class InvalidCommitTypeError extends DomainError {
  constructor(type: string) {
    super(`Invalid commit type: ${type}`);
    this.name = 'InvalidCommitTypeError';
  }
}

export class EmptyDescriptionError extends DomainError {
  constructor() {
    super('Description cannot be empty');
    this.name = 'EmptyDescriptionError';
  }
}

export class DescriptionTooLongError extends DomainError {
  constructor(length: number, maxLength: number) {
    super(`Description too long (${length}/${maxLength} characters)`);
    this.name = 'DescriptionTooLongError';
  }
}

export class BodyTooLongError extends DomainError {
  constructor(length: number, maxLength: number) {
    super(`Body too long (${length}/${maxLength} characters)`);
    this.name = 'BodyTooLongError';
  }
}

export class InvalidScopeFormatError extends DomainError {
  constructor(scope: string) {
    super(`Invalid scope format: ${scope}. Must be lowercase letters, numbers, and hyphens only`);
    this.name = 'InvalidScopeFormatError';
  }
}
