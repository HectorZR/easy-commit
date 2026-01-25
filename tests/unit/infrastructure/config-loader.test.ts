import { describe, expect, test } from 'bun:test';
import { ConfigLoader } from '../../../src/infrastructure/config/config-loader';

describe('ConfigLoader', () => {
  describe('getDefaults', () => {
    test('should return valid default configuration', () => {
      const config = ConfigLoader.getDefaults();

      expect(config).toBeDefined();
      expect(config.commit).toBeDefined();
      expect(config.timeouts).toBeDefined();
      expect(config.validator).toBeDefined();
      expect(config.logger).toBeDefined();
    });

    test('should have correct default values for commit', () => {
      const config = ConfigLoader.getDefaults();

      expect(config.commit.maxDescriptionLength).toBe(72);
      expect(config.commit.maxBodyLength).toBe(500);
      expect(config.commit.invalidChars).toEqual([]);
    });

    test('should have correct default values for timeouts', () => {
      const config = ConfigLoader.getDefaults();

      expect(config.timeouts.validation).toBe(5000);
      expect(config.timeouts.gitCommand).toBe(5000);
      expect(config.timeouts.userInput).toBe(300000);
      expect(config.timeouts.context).toBe(60000);
    });

    test('should have correct default values for validator', () => {
      const config = ConfigLoader.getDefaults();

      expect(config.validator.workers).toBe(4);
      expect(config.validator.workers).toBeGreaterThanOrEqual(1);
      expect(config.validator.workers).toBeLessThanOrEqual(16);
    });

    test('should have correct default values for logger', () => {
      const config = ConfigLoader.getDefaults();

      expect(config.logger.level).toBe('INFO');
    });
  });

  describe('loadOrDefault', () => {
    test('should return default config when no config file exists', () => {
      // This test assumes no config file exists in the test directory
      const config = ConfigLoader.loadOrDefault();

      expect(config).toBeDefined();
      expect(config.commit.maxDescriptionLength).toBe(72);
    });
  });
});
