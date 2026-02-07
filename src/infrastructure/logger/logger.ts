/**
 * Available log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

/**
 * Logger interface for dependency injection
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  setLevel(level: LogLevel): void;
}

/**
 * Simple logger implementation that writes to stderr
 * (stdout is used by ink for the TUI)
 */
export class ConsoleLogger implements Logger {
  constructor(private level: LogLevel = LogLevel.SILENT) {}

  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log('DEBUG', message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      this.log('INFO', message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      this.log('WARN', message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      this.log('ERROR', message, ...args);
    }
  }

  /**
   * Internal log method that formats and writes to stderr
   */
  private log(level: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    console.error(`[${level}] ${timestamp} ${message}`, ...args);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

/**
 * Parses a log level string into a LogLevel enum value
 */
export function parseLogLevel(level: string): LogLevel {
  switch (level.toUpperCase()) {
    case 'DEBUG':
      return LogLevel.DEBUG;
    case 'INFO':
      return LogLevel.INFO;
    case 'WARN':
      return LogLevel.WARN;
    case 'ERROR':
      return LogLevel.ERROR;
    case 'SILENT':
      return LogLevel.SILENT;
    default:
      return LogLevel.SILENT;
  }
}
