package shared

import (
	"bytes"
	"log"
	"strings"
	"testing"
)

func TestLogLevel_String(t *testing.T) {
	tests := []struct {
		level    LogLevel
		expected string
	}{
		{DEBUG, "DEBUG"},
		{INFO, "INFO"},
		{WARN, "WARN"},
		{ERROR, "ERROR"},
		{SILENT, "SILENT"},
		{LogLevel(99), "UNKNOWN"}, // Invalid level
	}

	for _, tt := range tests {
		t.Run(tt.expected, func(t *testing.T) {
			result := tt.level.String()
			if result != tt.expected {
				t.Errorf("Expected %s, got %s", tt.expected, result)
			}
		})
	}
}

func TestNewLogger(t *testing.T) {
	logger := NewLogger(INFO)

	if logger == nil {
		t.Fatal("Expected logger to be created, got nil")
	}

	if logger.level != INFO {
		t.Errorf("Expected level to be INFO, got %v", logger.level)
	}

	if logger.logger == nil {
		t.Error("Expected internal logger to be initialized")
	}
}

func TestNewLoggerWithOutput(t *testing.T) {
	prefix := "[TEST] "
	logger := NewLoggerWithOutput(DEBUG, prefix)

	if logger == nil {
		t.Fatal("Expected logger to be created, got nil")
	}

	if logger.level != DEBUG {
		t.Errorf("Expected level to be DEBUG, got %v", logger.level)
	}

	if logger.logger == nil {
		t.Error("Expected internal logger to be initialized")
	}
}

func TestLogger_SetLevel(t *testing.T) {
	logger := NewLogger(INFO)

	logger.SetLevel(DEBUG)
	if logger.level != DEBUG {
		t.Errorf("Expected level to be DEBUG after SetLevel, got %v", logger.level)
	}

	logger.SetLevel(ERROR)
	if logger.level != ERROR {
		t.Errorf("Expected level to be ERROR after SetLevel, got %v", logger.level)
	}
}

func TestLogger_GetLevel(t *testing.T) {
	tests := []LogLevel{DEBUG, INFO, WARN, ERROR, SILENT}

	for _, level := range tests {
		t.Run(level.String(), func(t *testing.T) {
			logger := NewLogger(level)
			result := logger.GetLevel()

			if result != level {
				t.Errorf("Expected GetLevel to return %v, got %v", level, result)
			}
		})
	}
}

func TestLogger_Debug(t *testing.T) {
	var buf bytes.Buffer
	logger := NewLogger(DEBUG)
	logger.logger = log.New(&buf, "", 0)

	logger.Debug("test debug message")

	output := buf.String()
	if !strings.Contains(output, "[DEBUG]") {
		t.Error("Expected output to contain [DEBUG]")
	}
	if !strings.Contains(output, "test debug message") {
		t.Error("Expected output to contain message")
	}
}

func TestLogger_Info(t *testing.T) {
	var buf bytes.Buffer
	logger := NewLogger(INFO)
	logger.logger = log.New(&buf, "", 0)

	logger.Info("test info message")

	output := buf.String()
	if !strings.Contains(output, "[INFO]") {
		t.Error("Expected output to contain [INFO]")
	}
	if !strings.Contains(output, "test info message") {
		t.Error("Expected output to contain message")
	}
}

func TestLogger_Warn(t *testing.T) {
	var buf bytes.Buffer
	logger := NewLogger(WARN)
	logger.logger = log.New(&buf, "", 0)

	logger.Warn("test warn message")

	output := buf.String()
	if !strings.Contains(output, "[WARN]") {
		t.Error("Expected output to contain [WARN]")
	}
	if !strings.Contains(output, "test warn message") {
		t.Error("Expected output to contain message")
	}
}

func TestLogger_Error(t *testing.T) {
	var buf bytes.Buffer
	logger := NewLogger(ERROR)
	logger.logger = log.New(&buf, "", 0)

	logger.Error("test error message")

	output := buf.String()
	if !strings.Contains(output, "[ERROR]") {
		t.Error("Expected output to contain [ERROR]")
	}
	if !strings.Contains(output, "test error message") {
		t.Error("Expected output to contain message")
	}
}

func TestLogger_LogLevelFiltering(t *testing.T) {
	tests := []struct {
		name        string
		loggerLevel LogLevel
		logFn       func(*Logger)
		shouldLog   bool
	}{
		{
			name:        "DEBUG logs at DEBUG level",
			loggerLevel: DEBUG,
			logFn:       func(l *Logger) { l.Debug("test") },
			shouldLog:   true,
		},
		{
			name:        "DEBUG does not log at INFO level",
			loggerLevel: INFO,
			logFn:       func(l *Logger) { l.Debug("test") },
			shouldLog:   false,
		},
		{
			name:        "INFO logs at INFO level",
			loggerLevel: INFO,
			logFn:       func(l *Logger) { l.Info("test") },
			shouldLog:   true,
		},
		{
			name:        "INFO does not log at WARN level",
			loggerLevel: WARN,
			logFn:       func(l *Logger) { l.Info("test") },
			shouldLog:   false,
		},
		{
			name:        "WARN logs at WARN level",
			loggerLevel: WARN,
			logFn:       func(l *Logger) { l.Warn("test") },
			shouldLog:   true,
		},
		{
			name:        "WARN does not log at ERROR level",
			loggerLevel: ERROR,
			logFn:       func(l *Logger) { l.Warn("test") },
			shouldLog:   false,
		},
		{
			name:        "ERROR logs at ERROR level",
			loggerLevel: ERROR,
			logFn:       func(l *Logger) { l.Error("test") },
			shouldLog:   true,
		},
		{
			name:        "ERROR does not log at SILENT level",
			loggerLevel: SILENT,
			logFn:       func(l *Logger) { l.Error("test") },
			shouldLog:   false,
		},
		{
			name:        "DEBUG logs at DEBUG when set to DEBUG",
			loggerLevel: DEBUG,
			logFn:       func(l *Logger) { l.Debug("test") },
			shouldLog:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var buf bytes.Buffer
			logger := NewLogger(tt.loggerLevel)
			logger.logger = log.New(&buf, "", 0)

			tt.logFn(logger)

			output := buf.String()
			hasOutput := len(output) > 0

			if tt.shouldLog && !hasOutput {
				t.Error("Expected log output, got none")
			}

			if !tt.shouldLog && hasOutput {
				t.Errorf("Expected no log output, got: %s", output)
			}
		})
	}
}

func TestLogger_FormatWithArgs(t *testing.T) {
	var buf bytes.Buffer
	logger := NewLogger(INFO)
	logger.logger = log.New(&buf, "", 0)

	logger.Info("user %s logged in with id %d", "john", 123)

	output := buf.String()
	if !strings.Contains(output, "user john logged in with id 123") {
		t.Errorf("Expected formatted output, got: %s", output)
	}
}

func TestParseLogLevel(t *testing.T) {
	tests := []struct {
		input    string
		expected LogLevel
	}{
		{"DEBUG", DEBUG},
		{"debug", DEBUG},
		{"DeBuG", DEBUG},
		{"INFO", INFO},
		{"info", INFO},
		{"WARN", WARN},
		{"warn", WARN},
		{"ERROR", ERROR},
		{"error", ERROR},
		{"SILENT", SILENT},
		{"silent", SILENT},
		{"unknown", INFO}, // Default
		{"", INFO},        // Default
		{"invalid", INFO}, // Default
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result := ParseLogLevel(tt.input)
			if result != tt.expected {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestLogger_SilentLevel(t *testing.T) {
	var buf bytes.Buffer
	logger := NewLogger(SILENT)
	logger.logger = log.New(&buf, "", 0)

	// Try logging at all levels
	logger.Debug("debug")
	logger.Info("info")
	logger.Warn("warn")
	logger.Error("error")

	output := buf.String()
	if len(output) > 0 {
		t.Errorf("Expected no output at SILENT level, got: %s", output)
	}
}

func TestLogger_MultipleMessages(t *testing.T) {
	var buf bytes.Buffer
	logger := NewLogger(INFO)
	logger.logger = log.New(&buf, "", 0)

	logger.Info("message 1")
	logger.Info("message 2")
	logger.Info("message 3")

	output := buf.String()

	if !strings.Contains(output, "message 1") {
		t.Error("Expected output to contain 'message 1'")
	}
	if !strings.Contains(output, "message 2") {
		t.Error("Expected output to contain 'message 2'")
	}
	if !strings.Contains(output, "message 3") {
		t.Error("Expected output to contain 'message 3'")
	}
}
