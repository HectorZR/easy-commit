import { beforeEach, describe, expect, test } from 'bun:test';
import { CliParser } from '../../../src/infrastructure/cli/cli-parser';

describe('CliParser', () => {
  let parser: CliParser;

  beforeEach(() => {
    parser = new CliParser('easy-commit', '1.0.0');
  });

  describe('parse', () => {
    test('should parse type option', () => {
      const config = parser.parse(['node', 'easy-commit', '-t', 'feat']);

      expect(config.type).toBe('feat');
    });

    test('should parse message option', () => {
      const config = parser.parse(['node', 'easy-commit', '-m', 'add new feature']);

      expect(config.message).toBe('add new feature');
    });

    test('should parse scope option', () => {
      const config = parser.parse(['node', 'easy-commit', '-s', 'auth']);

      expect(config.scope).toBe('auth');
    });

    test('should parse breaking flag', () => {
      const config = parser.parse(['node', 'easy-commit', '-b']);

      expect(config.breaking).toBe(true);
    });

    test('should parse interactive flag', () => {
      const config = parser.parse(['node', 'easy-commit', '-i']);

      expect(config.interactive).toBe(true);
    });

    test('should parse dry-run flag', () => {
      const config = parser.parse(['node', 'easy-commit', '--dry-run']);

      expect(config.dryRun).toBe(true);
    });

    test('should parse multiple options', () => {
      const config = parser.parse([
        'node',
        'easy-commit',
        '-t',
        'feat',
        '-m',
        'add login',
        '-s',
        'auth',
        '-b',
      ]);

      expect(config.type).toBe('feat');
      expect(config.message).toBe('add login');
      expect(config.scope).toBe('auth');
      expect(config.breaking).toBe(true);
    });

    test('should have default values for boolean flags', () => {
      const config = parser.parse(['node', 'easy-commit']);

      expect(config.breaking).toBe(false);
      expect(config.interactive).toBe(false);
      expect(config.dryRun).toBe(false);
    });
  });

  describe('isInteractive', () => {
    test('should return true when interactive flag is set', () => {
      const config = parser.parse(['node', 'easy-commit', '-i']);

      expect(parser.isInteractive(config)).toBe(true);
    });

    test('should return true when no type is provided', () => {
      const config = parser.parse(['node', 'easy-commit']);

      expect(parser.isInteractive(config)).toBe(true);
    });

    test('should return true when no message is provided', () => {
      const config = parser.parse(['node', 'easy-commit', '-t', 'feat']);

      expect(parser.isInteractive(config)).toBe(true);
    });

    test('should return false when type and message are provided', () => {
      const config = parser.parse(['node', 'easy-commit', '-t', 'feat', '-m', 'add feature']);

      expect(parser.isInteractive(config)).toBe(false);
    });

    test('should return true when interactive flag overrides type/message', () => {
      const config = parser.parse(['node', 'easy-commit', '-t', 'feat', '-m', 'add feature', '-i']);

      expect(parser.isInteractive(config)).toBe(true);
    });
  });
});
