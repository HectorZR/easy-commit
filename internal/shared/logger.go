package shared

import (
	"fmt"
	"log"
	"os"
)

type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARN
	ERROR
	SILENT
)

// String returns the string representation of the LogLevel.
func (l LogLevel) String() string {
	switch l {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	case SILENT:
		return "SILENT"
	default:
		return "UNKNOWN"
	}
}

type Logger struct {
	level  LogLevel
	logger *log.Logger
}

// NewLogger creates a new Logger instance with the specified log level.
func NewLogger(level LogLevel) *Logger {
	return &Logger{
		level:  level,
		logger: log.New(os.Stderr, "", log.LstdFlags),
	}
}

// NewLoggerWithOutput creates a new Logger instance with custom output and prefix.
func NewLoggerWithOutput(level LogLevel, prefix string) *Logger {
	return &Logger{
		level:  level,
		logger: log.New(os.Stderr, prefix, log.LstdFlags),
	}
}

// SetLevel sets the log level.
func (l *Logger) SetLevel(level LogLevel) {
	l.level = level
}

// GetLevel returns the current log level.
func (l *Logger) GetLevel() LogLevel {
	return l.level
}

// Debug logs a debug message
func (l *Logger) Debug(format string, args ...any) {
	if l.level <= DEBUG {
		l.log("DEBUG", format, args...)
	}
}

// Info logs an informational message
func (l *Logger) Info(format string, args ...any) {
	if l.level <= INFO {
		l.log("INFO", format, args...)
	}
}

// Warn logs a warning message
func (l *Logger) Warn(format string, args ...any) {
	if l.level <= WARN {
		l.log("WARN", format, args...)
	}
}

// Error logs an error message
func (l *Logger) Error(format string, args ...any) {
	if l.level <= ERROR {
		l.log("ERROR", format, args...)
	}
}

// log is the internal logging function
func (l *Logger) log(level, format string, args ...any) {
	message := fmt.Sprintf(format, args...)
	l.logger.Printf("[%s] %s", level, message)
}
