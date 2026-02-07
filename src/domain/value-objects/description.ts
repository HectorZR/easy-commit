export class Description {
  private constructor(private readonly value: string) {}

  static create(value: string, maxLength: number): Result<Description> {
    if (!value || value.trim().length === 0) {
      return { ok: false, error: 'Description cannot be empty' };
    }
    if (value.length > maxLength) {
      return {
        ok: false,
        error: `Description too long (${value.length}/${maxLength})`,
      };
    }
    // Conventional Commits: should start with lowercase
    const firstChar = value.charAt(0);
    if (firstChar && firstChar !== firstChar.toLowerCase()) {
      return {
        ok: false,
        error: 'Description should start with lowercase letter',
      };
    }
    return { ok: true, value: new Description(value) };
  }

  toString(): string {
    return this.value;
  }

  get length(): number {
    return this.value.length;
  }
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };
