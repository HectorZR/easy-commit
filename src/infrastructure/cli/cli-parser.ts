import { Command } from 'commander';

/**
 * CLI configuration parsed from command line arguments
 */
export interface CliConfig {
  type?: string;
  message?: string;
  scope?: string;
  breaking: boolean;
  interactive: boolean;
  dryRun: boolean;
}

/**
 * CliParser handles parsing command line arguments using commander
 */
export class CliParser {
  private program: Command;

  constructor(
    private appName: string,
    private appVersion: string
  ) {
    this.program = new Command();
    this.setupCommands();
  }

  /**
   * Sets up the CLI command structure and options
   */
  private setupCommands(): void {
    this.program
      .name(this.appName)
      .version(this.appVersion)
      .description('Create conventional commits with an interactive TUI')
      .option('-t, --type <type>', 'commit type (feat, fix, docs, etc.)')
      .option('-m, --message <message>', 'commit description')
      .option('-s, --scope <scope>', 'commit scope (optional)')
      .option('-b, --breaking', 'mark as breaking change', false)
      .option('-i, --interactive', 'force interactive mode', false)
      .option('--dry-run', 'preview commit without creating it', false)
      .addHelpText(
        'after',
        `
Examples:
  $ easy-commit                          # Interactive mode (TUI)
  $ easy-commit -t feat -m "add login"   # Direct mode
  $ easy-commit -t fix -m "fix bug" -s auth --breaking
  $ easy-commit --dry-run -t feat -m "test"

Commit Types:
  feat     - A new feature
  fix      - A bug fix
  docs     - Documentation only changes
  style    - Code style changes (formatting, semicolons, etc.)
  refactor - Code refactoring (no behavior change)
  test     - Adding or updating tests
  chore    - Maintenance tasks
  build    - Build system changes
  ci       - CI configuration changes
  perf     - Performance improvements
      `
      );
  }

  /**
   * Parses command line arguments and returns configuration
   */
  parse(args: string[]): CliConfig {
    this.program.parse(args, { from: 'user' });
    const opts = this.program.opts();

    return {
      type: opts.type,
      message: opts.message,
      scope: opts.scope,
      breaking: opts.breaking || false,
      interactive: opts.interactive || false,
      dryRun: opts.dryRun || false,
    };
  }

  /**
   * Determines if interactive mode should be used
   */
  isInteractive(config: CliConfig): boolean {
    // Interactive if explicitly requested or if type OR message not provided
    return config.interactive || !config.type || !config.message;
  }

  /**
   * Shows help information
   */
  showHelp(): void {
    this.program.help();
  }
}
