import { describe, expect, test } from 'bun:test';
import {
  COMMIT_TYPES,
  getCommitTypeByName,
  isValidCommitType,
} from '../../../src/domain/entities/commit-type';

describe('CommitType', () => {
  test('should have 10 commit types', () => {
    expect(COMMIT_TYPES).toHaveLength(10);
  });

  test('should include standard types', () => {
    const names = COMMIT_TYPES.map((t) => t.name);
    expect(names).toContain('feat');
    expect(names).toContain('fix');
    expect(names).toContain('docs');
    expect(names).toContain('style');
    expect(names).toContain('refactor');
    expect(names).toContain('test');
    expect(names).toContain('chore');
    expect(names).toContain('build');
    expect(names).toContain('ci');
    expect(names).toContain('perf');
  });

  test('each type should have name and description', () => {
    for (const type of COMMIT_TYPES) {
      expect(type.name).toBeTruthy();
      expect(type.description).toBeTruthy();
      expect(typeof type.name).toBe('string');
      expect(typeof type.description).toBe('string');
    }
  });

  describe('getCommitTypeByName', () => {
    test('should return correct type for valid name', () => {
      const type = getCommitTypeByName('feat');
      expect(type).toBeDefined();
      expect(type?.name).toBe('feat');
      expect(type?.description).toContain('feature');
    });

    test('should return correct type for fix', () => {
      const type = getCommitTypeByName('fix');
      expect(type).toBeDefined();
      expect(type?.name).toBe('fix');
      expect(type?.description).toContain('bug');
    });

    test('should return undefined for invalid type', () => {
      const type = getCommitTypeByName('invalid');
      expect(type).toBeUndefined();
    });

    test('should return undefined for empty string', () => {
      const type = getCommitTypeByName('');
      expect(type).toBeUndefined();
    });
  });

  describe('isValidCommitType', () => {
    test('should validate standard types', () => {
      expect(isValidCommitType('feat')).toBe(true);
      expect(isValidCommitType('fix')).toBe(true);
      expect(isValidCommitType('docs')).toBe(true);
      expect(isValidCommitType('style')).toBe(true);
      expect(isValidCommitType('refactor')).toBe(true);
      expect(isValidCommitType('test')).toBe(true);
      expect(isValidCommitType('chore')).toBe(true);
      expect(isValidCommitType('build')).toBe(true);
      expect(isValidCommitType('ci')).toBe(true);
      expect(isValidCommitType('perf')).toBe(true);
    });

    test('should reject invalid types', () => {
      expect(isValidCommitType('invalid')).toBe(false);
      expect(isValidCommitType('FEAT')).toBe(false); // Case sensitive
      expect(isValidCommitType('')).toBe(false);
      expect(isValidCommitType('feature')).toBe(false);
    });
  });
});
