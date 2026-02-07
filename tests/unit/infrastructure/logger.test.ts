import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { ConsoleLogger, LogLevel, parseLogLevel } from '../../../src/infrastructure/logger/logger';

describe('Logger', () => {
  describe('parseLogLevel', () => {
    test('should parse DEBUG level', () => {
      expect(parseLogLevel('DEBUG')).toBe(LogLevel.DEBUG);
      expect(parseLogLevel('debug')).toBe(LogLevel.DEBUG);
    });

    test('should parse INFO level', () => {
      expect(parseLogLevel('INFO')).toBe(LogLevel.INFO);
      expect(parseLogLevel('info')).toBe(LogLevel.INFO);
    });

    test('should parse WARN level', () => {
      expect(parseLogLevel('WARN')).toBe(LogLevel.WARN);
      expect(parseLogLevel('warn')).toBe(LogLevel.WARN);
    });

    test('should parse ERROR level', () => {
      expect(parseLogLevel('ERROR')).toBe(LogLevel.ERROR);
      expect(parseLogLevel('error')).toBe(LogLevel.ERROR);
    });

    test('should parse SILENT level', () => {
      expect(parseLogLevel('SILENT')).toBe(LogLevel.SILENT);
      expect(parseLogLevel('silent')).toBe(LogLevel.SILENT);
    });

    test('should default to SILENT for unknown level', () => {
      expect(parseLogLevel('INVALID')).toBe(LogLevel.SILENT);
      expect(parseLogLevel('')).toBe(LogLevel.SILENT);
    });
  });

  describe('ConsoleLogger', () => {
    let logger: ConsoleLogger;
    let originalConsoleError: typeof console.error;
    let logOutput: string[];

    beforeEach(() => {
      logOutput = [];
      originalConsoleError = console.error;
      console.error = (...args: unknown[]) => {
        logOutput.push(args.join(' '));
      };
    });

    afterEach(() => {
      console.error = originalConsoleError;
    });

    test('should log debug messages when level is DEBUG', () => {
      logger = new ConsoleLogger(LogLevel.DEBUG);
      logger.debug('test message');

      expect(logOutput.length).toBe(1);
      expect(logOutput[0]).toContain('[DEBUG]');
      expect(logOutput[0]).toContain('test message');
    });

    test('should not log debug messages when level is INFO', () => {
      logger = new ConsoleLogger(LogLevel.INFO);
      logger.debug('test message');

      expect(logOutput.length).toBe(0);
    });

    test('should log info messages when level is INFO', () => {
      logger = new ConsoleLogger(LogLevel.INFO);
      logger.info('test message');

      expect(logOutput.length).toBe(1);
      expect(logOutput[0]).toContain('[INFO]');
      expect(logOutput[0]).toContain('test message');
    });

    test('should not log info messages when level is WARN', () => {
      logger = new ConsoleLogger(LogLevel.WARN);
      logger.info('test message');

      expect(logOutput.length).toBe(0);
    });

    test('should log warn messages when level is WARN', () => {
      logger = new ConsoleLogger(LogLevel.WARN);
      logger.warn('test message');

      expect(logOutput.length).toBe(1);
      expect(logOutput[0]).toContain('[WARN]');
      expect(logOutput[0]).toContain('test message');
    });

    test('should not log warn messages when level is ERROR', () => {
      logger = new ConsoleLogger(LogLevel.ERROR);
      logger.warn('test message');

      expect(logOutput.length).toBe(0);
    });

    test('should log error messages when level is ERROR', () => {
      logger = new ConsoleLogger(LogLevel.ERROR);
      logger.error('test message');

      expect(logOutput.length).toBe(1);
      expect(logOutput[0]).toContain('[ERROR]');
      expect(logOutput[0]).toContain('test message');
    });

    test('should not log any messages when level is SILENT', () => {
      logger = new ConsoleLogger(LogLevel.SILENT);
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');

      expect(logOutput.length).toBe(0);
    });

    test('should change log level dynamically', () => {
      logger = new ConsoleLogger(LogLevel.INFO);
      logger.debug('should not appear');

      expect(logOutput.length).toBe(0);

      logger.setLevel(LogLevel.DEBUG);
      logger.debug('should appear');

      expect(logOutput.length).toBe(1);
      expect(logOutput[0]).toContain('should appear');
    });

    test('should log additional arguments', () => {
      logger = new ConsoleLogger(LogLevel.INFO);
      logger.info('test', 'arg1', 123, { key: 'value' });

      expect(logOutput.length).toBe(1);
      expect(logOutput[0]).toContain('test');
      expect(logOutput[0]).toContain('arg1');
      expect(logOutput[0]).toContain('123');
    });
  });
});
