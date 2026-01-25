import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { load } from 'js-yaml';
import { z } from 'zod';

/**
 * Zod schema for configuration validation
 */
const ConfigSchema = z
  .object({
    commit: z
      .object({
        maxDescriptionLength: z.number().optional(),
        maxBodyLength: z.number().optional(),
        invalidChars: z.array(z.string()).optional(),
      })
      .optional(),
    timeouts: z
      .object({
        validation: z.number().optional(),
        gitCommand: z.number().optional(),
        userInput: z.number().optional(),
        context: z.number().optional(),
      })
      .optional(),
    validator: z
      .object({
        workers: z.number().min(1).max(16).optional(),
      })
      .optional(),
    logger: z
      .object({
        level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT']).optional(),
      })
      .optional(),
  })
  .transform((data) => ({
    commit: {
      maxDescriptionLength: data.commit?.maxDescriptionLength ?? 72,
      maxBodyLength: data.commit?.maxBodyLength ?? 500,
      invalidChars: data.commit?.invalidChars ?? [],
    },
    timeouts: {
      validation: data.timeouts?.validation ?? 5000,
      gitCommand: data.timeouts?.gitCommand ?? 5000,
      userInput: data.timeouts?.userInput ?? 300000,
      context: data.timeouts?.context ?? 60000,
    },
    validator: {
      workers: data.validator?.workers ?? 4,
    },
    logger: {
      level: data.logger?.level ?? ('INFO' as const),
    },
  }));

export type Config = z.infer<typeof ConfigSchema>;

/**
 * ConfigLoader handles loading and validating configuration from YAML files.
 * It searches for config files in the current directory first, then the home directory.
 * Falls back to defaults if no config file is found.
 */
export class ConfigLoader {
  private static CONFIG_FILENAMES = [
    '.easy-commit.yaml',
    '.easy-commit.yml',
    'easy-commit.yaml',
    'easy-commit.yml',
  ];

  /**
   * Loads configuration from files or returns defaults
   */
  static loadOrDefault(): Config {
    // Try current directory
    for (const filename of ConfigLoader.CONFIG_FILENAMES) {
      if (existsSync(filename)) {
        return ConfigLoader.loadFromFile(filename);
      }
    }

    // Try home directory
    const homeDir = homedir();
    for (const filename of ConfigLoader.CONFIG_FILENAMES) {
      const fullPath = join(homeDir, filename);
      if (existsSync(fullPath)) {
        return ConfigLoader.loadFromFile(fullPath);
      }
    }

    // Return defaults
    return ConfigSchema.parse({});
  }

  /**
   * Loads and validates configuration from a specific file
   */
  private static loadFromFile(path: string): Config {
    try {
      const content = readFileSync(path, 'utf-8');
      const parsed = load(content);
      return ConfigSchema.parse(parsed);
    } catch (error) {
      console.warn(`Warning: Failed to parse config file ${path}, using defaults`);
      console.warn(error);
      return ConfigSchema.parse({});
    }
  }

  /**
   * Returns the default configuration
   */
  static getDefaults(): Config {
    return ConfigSchema.parse({});
  }
}
