export class Scope {
  private constructor(private readonly value: string) {}

  static create(value: string): Result<Scope> {
    if (!value || value.trim().length === 0) {
      return { ok: false, error: 'Scope cannot be empty' };
    }
    // Scope should be lowercase with hyphens only
    if (!/^[a-z0-9-]+$/.test(value)) {
      return {
        ok: false,
        error: 'Scope must contain only lowercase letters, numbers, and hyphens',
      };
    }
    if (value.length > 30) {
      return { ok: false, error: 'Scope too long (max 30 characters)' };
    }
    return { ok: true, value: new Scope(value) };
  }

  toString(): string {
    return this.value;
  }
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };
