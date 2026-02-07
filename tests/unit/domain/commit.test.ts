import { describe, expect, test } from 'bun:test';
import { Commit } from '../../../src/domain/entities/commit';
import type { CommitConfig } from '../../../src/domain/types';

describe('Commit', () => {
  const defaultConfig: CommitConfig = {
    maxDescriptionLength: 72,
    maxBodyLength: 500,
    invalidChars: [],
  };

  describe('validation', () => {
    test('should validate a valid commit', () => {
      const commit = new Commit('feat', 'add new feature');
      const result = commit.validate(defaultConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject empty description', () => {
      const commit = new Commit('feat', '');
      const result = commit.validate(defaultConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Description cannot be empty');
    });

    test('should reject description that is too long', () => {
      const longDesc = 'a'.repeat(73);
      const commit = new Commit('feat', longDesc);
      const result = commit.validate(defaultConfig);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Description too long');
    });

    test('should reject body that is too long', () => {
      const longBody = 'a'.repeat(501);
      const commit = new Commit('feat', 'description', undefined, longBody);
      const result = commit.validate(defaultConfig);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Body too long');
    });

    test('should reject invalid characters in description', () => {
      const config: CommitConfig = {
        ...defaultConfig,
        invalidChars: ['@', '#'],
      };
      const commit = new Commit('feat', 'add @feature');
      const result = commit.validate(config);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("invalid character: '@'");
    });
  });

  describe('formatting', () => {
    test('should format commit without scope or body', () => {
      const commit = new Commit('feat', 'add new feature');
      const formatted = commit.format();

      expect(formatted).toBe('feat: add new feature');
    });

    test('should format commit with scope', () => {
      const commit = new Commit('feat', 'add login', 'auth');
      const formatted = commit.format();

      expect(formatted).toBe('feat(auth): add login');
    });

    test('should format commit with body', () => {
      const commit = new Commit('feat', 'add feature', undefined, 'This is the body');
      const formatted = commit.format();

      expect(formatted).toContain('feat: add feature');
      expect(formatted).toContain('This is the body');
    });

    test('should format commit with breaking change', () => {
      const commit = new Commit('feat', 'change API', undefined, undefined, true);
      const formatted = commit.format();

      expect(formatted).toContain('BREAKING CHANGE:');
    });

    test('should preserve body formatting without wrapping', () => {
      const longBody =
        'This is a very long body text that should NOT be wrapped at 72 characters.\nIt should preserve newlines\nand formatting exactly as entered by the user.';
      const commit = new Commit('feat', 'add feature', undefined, longBody);
      const formatted = commit.format();

      expect(formatted).toContain(
        'This is a very long body text that should NOT be wrapped at 72 characters.'
      );
      expect(formatted).toContain('It should preserve newlines');
      expect(formatted).toContain('and formatting exactly as entered by the user.');
    });
  });

  describe('helper methods', () => {
    test('isBreaking should return correct value', () => {
      const breaking = new Commit('feat', 'test', undefined, undefined, true);
      const notBreaking = new Commit('feat', 'test');

      expect(breaking.isBreaking()).toBe(true);
      expect(notBreaking.isBreaking()).toBe(false);
    });

    test('hasScope should return correct value', () => {
      const withScope = new Commit('feat', 'test', 'auth');
      const withoutScope = new Commit('feat', 'test');

      expect(withScope.hasScope()).toBe(true);
      expect(withoutScope.hasScope()).toBe(false);
    });
  });
});
