#!/usr/bin/env bun
import { text } from '@infrastructure/ui/styles';
import { CommitService } from './application/services/commit-service';
import { createDefaultValidator } from './application/validators/concurrent-validator';
import { Commit } from './domain/entities/commit';
import { CliParser } from './infrastructure/cli/cli-parser';
import { ConfigLoader } from './infrastructure/config/config-loader';
import { GitExecutor } from './infrastructure/git/git-executor';
import { ConsoleLogger, parseLogLevel } from './infrastructure/logger/logger';
import { runInteractiveTUI } from './infrastructure/ui/App';
import { VERSION } from './version';

async function main() {
  // 1. Load configuration
  const config = ConfigLoader.loadOrDefault();

  // 2. Parse CLI arguments
  const parser = new CliParser('easy-commit', VERSION);
  const cliConfig = parser.parse(process.argv);

  // 3. Initialize logger
  const logLevel = parseLogLevel(config.logger.level);
  const logger = new ConsoleLogger(logLevel);
  logger.info(`Starting easy-commit v${VERSION}`);

  // 4. Initialize dependencies
  const gitRepo = new GitExecutor(logger);
  const validator = createDefaultValidator(config);
  const service = new CommitService(gitRepo, validator, logger, config);

  // 5. Check git repository
  if (!(await gitRepo.isGitRepository())) {
    console.error('Error: Not a git repository');
    console.error('Please run this command from within a git repository.');
    process.exit(1);
  }

  try {
    const isInteractive = parser.isInteractive(cliConfig);

    if (isInteractive) {
      console.clear();
      // Interactive mode with TUI
      logger.info('Running in interactive mode with TUI');
      const commit = await runInteractiveTUI();

      if (!commit) {
        console.warn(text.warning('Commit creation cancelled by user'));
        process.exit(0);
      }

      console.log();
      await service.createCommit(commit);
      console.log('\n✓ Commit created successfully!');
    } else {
      // Direct mode
      logger.info('Running in direct mode');

      // Validate required fields for direct mode
      if (!cliConfig.type || !cliConfig.message) {
        console.error('Error: Type and message are required for direct mode');
        console.error('Use --help for usage information');
        process.exit(1);
      }

      const commit = new Commit(
        cliConfig.type,
        cliConfig.message,
        cliConfig.scope,
        undefined,
        cliConfig.breaking
      );

      if (cliConfig.dryRun) {
        console.log('Preview (dry-run):');
        console.log(service.previewCommit(commit));
        process.exit(0);
      }

      await service.createCommit(commit);
      console.log('✓ Commit created successfully!');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      logger.error('Error:', error);
    }
    process.exit(1);
  }
}

// Run the main function
main();
