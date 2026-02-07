import { beforeEach, describe, expect, test } from 'bun:test';
import {
  ConcurrentValidator,
  createDefaultValidator,
} from '../../../src/application/validators/concurrent-validator';
import { Commit } from '../../../src/domain/entities/commit';
import type { Config } from '../../../src/infrastructure/config/config-loader';

describe('ConcurrentValidator', () => {
  let validator: ConcurrentValidator;

  beforeEach(() => {
    validator = new ConcurrentValidator();
  });

  describe('basic functionality', () => {
    test('should start with no rules', () => {
      expect(validator.getRuleCount()).toBe(0);
    });

    test('should add rules', () => {
      validator.addRule(async () => null);
      validator.addRule(async () => null);

      expect(validator.getRuleCount()).toBe(2);
    });

    test('should validate successfully when all rules pass', async () => {
      validator.addRule(async () => null);
      validator.addRule(async () => null);

      const commit = new Commit('feat', 'add feature');
      const result = await validator.validate(commit);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should collect errors from failing rules', async () => {
      validator.addRule(async () => 'Error 1');
      validator.addRule(async () => null);
      validator.addRule(async () => 'Error 2');

      const commit = new Commit('feat', 'add feature');
      const result = await validator.validate(commit);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Error 1');
      expect(result.errors).toContain('Error 2');
    });

    test('should run rules concurrently', async () => {
      const executionOrder: number[] = [];

      validator.addRule(async (_commit) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        executionOrder.push(1);
        return null;
      });

      validator.addRule(async (_commit) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        executionOrder.push(2);
        return null;
      });

      validator.addRule(async (_commit) => {
        await new Promise((resolve) => setTimeout(resolve, 30));
        executionOrder.push(3);
        return null;
      });

      const commit = new Commit('feat', 'add feature');
      await validator.validate(commit);

      // If concurrent, shorter delays finish first
      expect(executionOrder).toEqual([2, 3, 1]);
    });
  });

  describe('createDefaultValidator', () => {
    let defaultValidator: ConcurrentValidator;
    const defaultConfig: Config = {
      commit: {
        maxDescriptionLength: 72,
        maxBodyLength: 500,
        invalidChars: ['@', '#'],
      },
      timeouts: {
        validation: 5000,
        gitCommand: 5000,
        userInput: 300000,
        context: 60000,
      },
      validator: {
        workers: 4,
      },
      logger: {
        level: 'INFO',
      },
    };

    beforeEach(() => {
      defaultValidator = createDefaultValidator(defaultConfig);
    });

    test('should have all default rules registered', () => {
      // Default validator should have 8 rules
      expect(defaultValidator.getRuleCount()).toBe(8);
    });

    describe('description validation', () => {
      test('should reject empty description', async () => {
        const commit = new Commit('feat', '');
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Description cannot be empty');
      });

      test('should reject whitespace-only description', async () => {
        const commit = new Commit('feat', '   ');
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Description cannot be empty');
      });

      test('should reject description that is too long', async () => {
        const longDesc = 'a'.repeat(73);
        const commit = new Commit('feat', longDesc);
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Description too long'))).toBe(true);
      });

      test('should reject description starting with uppercase', async () => {
        const commit = new Commit('feat', 'Add feature');
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Description should start with lowercase letter');
      });

      test('should accept valid description', async () => {
        const commit = new Commit('feat', 'add new feature');
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('body validation', () => {
      test('should accept commit without body', async () => {
        const commit = new Commit('feat', 'add feature');
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(true);
      });

      test('should accept body within length limit', async () => {
        const body = 'This is a valid body';
        const commit = new Commit('feat', 'add feature', undefined, body);
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(true);
      });

      test('should reject body that is too long', async () => {
        const longBody = 'a'.repeat(501);
        const commit = new Commit('feat', 'add feature', undefined, longBody);
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Body too long'))).toBe(true);
      });
    });

    describe('commit type validation', () => {
      test('should accept valid commit types', async () => {
        const types = [
          'feat',
          'fix',
          'docs',
          'style',
          'refactor',
          'test',
          'chore',
          'build',
          'ci',
          'perf',
        ];

        for (const type of types) {
          const commit = new Commit(type, 'test description');
          const result = await defaultValidator.validate(commit);
          expect(result.valid).toBe(true);
        }
      });

      test('should reject invalid commit type', async () => {
        const commit = new Commit('invalid', 'test description');
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Invalid commit type: invalid');
      });
    });

    describe('scope validation', () => {
      test('should accept commit without scope', async () => {
        const commit = new Commit('feat', 'add feature');
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(true);
      });

      test('should accept valid scope format', async () => {
        const validScopes = ['auth', 'api', 'ui', 'core-module', 'feature123'];

        for (const scope of validScopes) {
          const commit = new Commit('feat', 'test', scope);
          const result = await defaultValidator.validate(commit);
          expect(result.valid).toBe(true);
        }
      });

      test('should reject scope with uppercase letters', async () => {
        const commit = new Commit('feat', 'test', 'Auth');
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Invalid scope format'))).toBe(true);
      });

      test('should reject scope with special characters', async () => {
        const invalidScopes = ['auth_module', 'api.client', 'ui@component', 'core/module'];

        for (const scope of invalidScopes) {
          const commit = new Commit('feat', 'test', scope);
          const result = await defaultValidator.validate(commit);
          expect(result.valid).toBe(false);
        }
      });

      test('should reject scope that is too long', async () => {
        const longScope = 'a'.repeat(31);
        const commit = new Commit('feat', 'test', longScope);
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes('Scope too long'))).toBe(true);
      });
    });

    describe('invalid characters validation', () => {
      test('should reject description with invalid characters', async () => {
        const commit1 = new Commit('feat', 'add @mention feature');
        const result1 = await defaultValidator.validate(commit1);

        expect(result1.valid).toBe(false);
        expect(result1.errors.some((e) => e.includes("invalid character: '@'"))).toBe(true);

        const commit2 = new Commit('feat', 'add #hashtag feature');
        const result2 = await defaultValidator.validate(commit2);

        expect(result2.valid).toBe(false);
        expect(result2.errors.some((e) => e.includes("invalid character: '#'"))).toBe(true);
      });

      test('should accept description without invalid characters', async () => {
        const commit = new Commit('feat', 'add new feature');
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(true);
      });
    });

    describe('complex scenarios', () => {
      test('should validate complete valid commit', async () => {
        const commit = new Commit(
          'feat',
          'add user authentication',
          'auth',
          'Implement JWT-based authentication with refresh tokens',
          false
        );
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('should collect multiple errors for invalid commit', async () => {
        const longDesc = 'A'.repeat(73);
        const longBody = 'b'.repeat(501);
        const commit = new Commit('invalid', longDesc, 'INVALID_SCOPE', longBody);
        const result = await defaultValidator.validate(commit);

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(3);
      });
    });
  });
});
