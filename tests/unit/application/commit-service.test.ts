import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { CommitService } from '../../../src/application/services/commit-service';
import { Commit } from '../../../src/domain/entities/commit';
import type { CommitValidator } from '../../../src/domain/repositories/commit-validator';
import type { GitRepository } from '../../../src/domain/repositories/git-repository';
import type { ValidationResult } from '../../../src/domain/types';
import type { Config } from '../../../src/infrastructure/config/config-loader';
import type { Logger } from '../../../src/infrastructure/logger/logger';

describe('CommitService', () => {
  let service: CommitService;
  let mockGitRepo: GitRepository;
  let mockValidator: CommitValidator;
  let mockLogger: Logger;
  let mockConfig: Config;

  beforeEach(() => {
    // Create mock implementations
    mockGitRepo = {
      isGitRepository: mock(async () => true),
      hasStagedChanges: mock(async () => true),
      commit: mock(async () => {}),
      getLastCommitMessage: mock(async () => 'Previous commit message'),
    };

    mockValidator = {
      validate: mock(async () => ({ valid: true, errors: [] })),
    };

    mockLogger = {
      debug: mock(() => {}),
      info: mock(() => {}),
      warn: mock(() => {}),
      error: mock(() => {}),
      setLevel: mock(() => {}),
    };

    mockConfig = {
      commit: {
        maxDescriptionLength: 72,
        maxBodyLength: 500,
        invalidChars: [],
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

    service = new CommitService(mockGitRepo, mockValidator, mockLogger, mockConfig);
  });

  describe('createCommit', () => {
    test('should successfully create a valid commit', async () => {
      const commit = new Commit('feat', 'add feature');

      await service.createCommit(commit);

      expect(mockGitRepo.isGitRepository).toHaveBeenCalled();
      expect(mockGitRepo.hasStagedChanges).toHaveBeenCalled();
      expect(mockValidator.validate).toHaveBeenCalledWith(commit);
      expect(mockGitRepo.commit).toHaveBeenCalledWith('feat: add feature');
    });

    test('should throw error if not a git repository', async () => {
      mockGitRepo.isGitRepository = mock(async () => false);
      const commit = new Commit('feat', 'add feature');

      await expect(service.createCommit(commit)).rejects.toThrow('Not a git repository');

      expect(mockGitRepo.commit).not.toHaveBeenCalled();
    });

    test('should throw error if no staged changes', async () => {
      mockGitRepo.hasStagedChanges = mock(async () => false);
      const commit = new Commit('feat', 'add feature');

      await expect(service.createCommit(commit)).rejects.toThrow('No staged changes to commit');

      expect(mockGitRepo.commit).not.toHaveBeenCalled();
    });

    test('should throw error if validation fails', async () => {
      const validationResult: ValidationResult = {
        valid: false,
        errors: ['Error 1', 'Error 2'],
      };
      mockValidator.validate = mock(async () => validationResult);
      const commit = new Commit('feat', 'add feature');

      await expect(service.createCommit(commit)).rejects.toThrow('Validation failed');

      expect(mockGitRepo.commit).not.toHaveBeenCalled();
    });

    test('should format commit message correctly', async () => {
      const commit = new Commit('feat', 'add login', 'auth', 'Add JWT authentication', true);

      await service.createCommit(commit);

      const expectedMessage = commit.format();
      expect(mockGitRepo.commit).toHaveBeenCalledWith(expectedMessage);
    });

    test('should call git commit with formatted message', async () => {
      const commit = new Commit('fix', 'resolve bug', 'core');

      await service.createCommit(commit);

      expect(mockGitRepo.commit).toHaveBeenCalledWith('fix(core): resolve bug');
    });

    test('should log workflow steps', async () => {
      const commit = new Commit('feat', 'add feature');

      await service.createCommit(commit);

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('workflow'));
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('successfully'));
    });

    test('should handle git commit errors', async () => {
      mockGitRepo.commit = mock(async () => {
        throw new Error('Git commit failed');
      });
      const commit = new Commit('feat', 'add feature');

      await expect(service.createCommit(commit)).rejects.toThrow('Git commit failed');
    });
  });

  describe('previewCommit', () => {
    test('should return formatted commit message', () => {
      const commit = new Commit('feat', 'add feature');
      const preview = service.previewCommit(commit);

      expect(preview).toBe('feat: add feature');
    });

    test('should format commit with scope', () => {
      const commit = new Commit('fix', 'resolve bug', 'api');
      const preview = service.previewCommit(commit);

      expect(preview).toBe('fix(api): resolve bug');
    });

    test('should format commit with body', () => {
      const commit = new Commit('feat', 'add feature', undefined, 'Body text');
      const preview = service.previewCommit(commit);

      expect(preview).toContain('feat: add feature');
      expect(preview).toContain('Body text');
    });

    test('should format commit with breaking change', () => {
      const commit = new Commit('feat', 'change api', undefined, undefined, true);
      const preview = service.previewCommit(commit);

      expect(preview).toContain('BREAKING CHANGE:');
    });
  });

  describe('validateCommit', () => {
    test('should return validation result', async () => {
      const commit = new Commit('feat', 'add feature');
      const result = await service.validateCommit(commit);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(mockValidator.validate).toHaveBeenCalledWith(commit);
    });

    test('should return validation errors', async () => {
      const validationResult: ValidationResult = {
        valid: false,
        errors: ['Error 1', 'Error 2'],
      };
      mockValidator.validate = mock(async () => validationResult);
      const commit = new Commit('feat', 'add feature');

      const result = await service.validateCommit(commit);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(['Error 1', 'Error 2']);
    });
  });

  describe('getConfig', () => {
    test('should return configuration', () => {
      const config = service.getConfig();

      expect(config).toBe(mockConfig);
      expect(config.commit.maxDescriptionLength).toBe(72);
      expect(config.validator.workers).toBe(4);
    });
  });

  describe('isGitRepository', () => {
    test('should return true for git repository', async () => {
      const result = await service.isGitRepository();

      expect(result).toBe(true);
      expect(mockGitRepo.isGitRepository).toHaveBeenCalled();
    });

    test('should return false for non-git directory', async () => {
      mockGitRepo.isGitRepository = mock(async () => false);

      const result = await service.isGitRepository();

      expect(result).toBe(false);
    });
  });

  describe('hasStagedChanges', () => {
    test('should return true when changes are staged', async () => {
      const result = await service.hasStagedChanges();

      expect(result).toBe(true);
      expect(mockGitRepo.hasStagedChanges).toHaveBeenCalled();
    });

    test('should return false when no changes are staged', async () => {
      mockGitRepo.hasStagedChanges = mock(async () => false);

      const result = await service.hasStagedChanges();

      expect(result).toBe(false);
    });
  });

  describe('getLastCommitMessage', () => {
    test('should return last commit message', async () => {
      const message = await service.getLastCommitMessage();

      expect(message).toBe('Previous commit message');
      expect(mockGitRepo.getLastCommitMessage).toHaveBeenCalled();
    });

    test('should handle empty commit history', async () => {
      mockGitRepo.getLastCommitMessage = mock(async () => '');

      const message = await service.getLastCommitMessage();

      expect(message).toBe('');
    });
  });

  describe('integration scenarios', () => {
    test('should complete full workflow successfully', async () => {
      const commit = new Commit(
        'feat',
        'add authentication',
        'auth',
        'Implement JWT with refresh tokens',
        false
      );

      await service.createCommit(commit);

      // Verify workflow steps
      expect(mockGitRepo.isGitRepository).toHaveBeenCalled();
      expect(mockGitRepo.hasStagedChanges).toHaveBeenCalled();
      expect(mockValidator.validate).toHaveBeenCalled();
      expect(mockGitRepo.commit).toHaveBeenCalled();

      // Verify final message format
      const expectedMessage = 'feat(auth): add authentication\n\nImplement JWT with refresh tokens';
      expect(mockGitRepo.commit).toHaveBeenCalledWith(expectedMessage);
    });

    test('should handle validation errors gracefully', async () => {
      mockValidator.validate = mock(async () => ({
        valid: false,
        errors: ['Description too long', 'Invalid characters'],
      }));
      const commit = new Commit('feat', 'add feature');

      await expect(service.createCommit(commit)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockGitRepo.commit).not.toHaveBeenCalled();
    });
  });
});
