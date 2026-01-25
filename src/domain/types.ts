export interface CommitConfig {
  maxDescriptionLength: number;
  maxBodyLength: number;
  invalidChars: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
