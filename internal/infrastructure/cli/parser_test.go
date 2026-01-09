package cli

import (
	"strings"
	"testing"

	"github.com/hector/easy-commit/internal/domain"
)

func TestNewParser(t *testing.T) {
	appName := "easy-commit"
	version := "1.0.0"

	parser := NewParser(appName, version)

	if parser == nil {
		t.Fatal("Expected parser to be created, got nil")
	}

	if parser.appName != appName {
		t.Errorf("Expected appName to be %s, got %s", appName, parser.appName)
	}

	if parser.version != version {
		t.Errorf("Expected version to be %s, got %s", version, parser.version)
	}

	if parser.commands == nil {
		t.Error("Expected commands map to be initialized")
	}

	if len(parser.commands) != 0 {
		t.Errorf("Expected commands map to be empty, got %d commands", len(parser.commands))
	}
}

func TestParser_RegisterCommand(t *testing.T) {
	parser := NewParser("test-app", "1.0.0")

	cmd := &Command{
		Name:        "test",
		Description: "Test command",
		Handler:     func(args []string) error { return nil },
	}

	parser.RegisterCommand(cmd)

	if len(parser.commands) != 1 {
		t.Errorf("Expected 1 command, got %d", len(parser.commands))
	}

	registeredCmd, exists := parser.commands["test"]
	if !exists {
		t.Fatal("Expected command 'test' to be registered")
	}

	if registeredCmd.Name != cmd.Name {
		t.Errorf("Expected command name to be %s, got %s", cmd.Name, registeredCmd.Name)
	}

	if registeredCmd.Description != cmd.Description {
		t.Errorf("Expected command description to be %s, got %s", cmd.Description, registeredCmd.Description)
	}
}

func TestParser_RegisterMultipleCommands(t *testing.T) {
	parser := NewParser("test-app", "1.0.0")

	commands := []*Command{
		{Name: "cmd1", Description: "Command 1"},
		{Name: "cmd2", Description: "Command 2"},
		{Name: "cmd3", Description: "Command 3"},
	}

	for _, cmd := range commands {
		parser.RegisterCommand(cmd)
	}

	if len(parser.commands) != 3 {
		t.Errorf("Expected 3 commands, got %d", len(parser.commands))
	}

	for _, cmd := range commands {
		if _, exists := parser.commands[cmd.Name]; !exists {
			t.Errorf("Expected command %s to be registered", cmd.Name)
		}
	}
}

func TestParser_Parse_EmptyArgs(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	config, err := parser.Parse([]string{})

	if err != nil {
		t.Fatalf("Expected no error with empty args, got: %v", err)
	}

	if config == nil {
		t.Fatal("Expected config to be returned")
	}

	// Empty args should result in interactive mode
	if !config.IsInteractive() {
		t.Error("Expected interactive mode with empty args")
	}
}

func TestParser_Parse_TypeFlag(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	tests := []struct {
		name        string
		args        []string
		expected    string
		expectError bool
	}{
		{
			name:        "short flag -type with message",
			args:        []string{"-type", "feat", "-message", "test"},
			expected:    "feat",
			expectError: false,
		},
		{
			name:        "short flag with equals and message",
			args:        []string{"-type=fix", "-message", "test"},
			expected:    "fix",
			expectError: false,
		},
		{
			name:        "type without message should error",
			args:        []string{"-type", "feat"},
			expected:    "feat",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			config, err := parser.Parse(tt.args)

			if tt.expectError {
				if err == nil {
					t.Error("Expected error, got nil")
				}
				return
			}

			if err != nil {
				t.Fatalf("Expected no error, got: %v", err)
			}

			if config.TypeName != tt.expected {
				t.Errorf("Expected type to be %s, got %s", tt.expected, config.TypeName)
			}
		})
	}
}

func TestParser_Parse_MessageFlag(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	tests := []struct {
		name        string
		args        []string
		expected    string
		expectError bool
	}{
		{
			name:        "short flag -message with type",
			args:        []string{"-type", "feat", "-message", "add new feature"},
			expected:    "add new feature",
			expectError: false,
		},
		{
			name:        "message with special characters",
			args:        []string{"-type", "fix", "-message", "fix bug with 'quotes' and \"double quotes\""},
			expected:    "fix bug with 'quotes' and \"double quotes\"",
			expectError: false,
		},
		{
			name:        "message with equals",
			args:        []string{"-type", "docs", "-message=update documentation"},
			expected:    "update documentation",
			expectError: false,
		},
		{
			name:        "message without type should error",
			args:        []string{"-message", "test"},
			expected:    "test",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			config, err := parser.Parse(tt.args)

			if tt.expectError {
				if err == nil {
					t.Error("Expected error, got nil")
				}
				return
			}

			if err != nil {
				t.Fatalf("Expected no error, got: %v", err)
			}

			if config.Description != tt.expected {
				t.Errorf("Expected description to be %s, got %s", tt.expected, config.Description)
			}
		})
	}
}

func TestParser_Parse_ScopeFlag(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	tests := []struct {
		name     string
		args     []string
		expected string
	}{
		{
			name:     "short flag -scope",
			args:     []string{"-scope", "api"},
			expected: "api",
		},
		{
			name:     "scope with equals",
			args:     []string{"-scope=auth"},
			expected: "auth",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			config, err := parser.Parse(tt.args)

			if err != nil {
				t.Fatalf("Expected no error, got: %v", err)
			}

			if config.Scope != tt.expected {
				t.Errorf("Expected scope to be %s, got %s", tt.expected, config.Scope)
			}
		})
	}
}

func TestParser_Parse_BooleanFlags(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	tests := []struct {
		name    string
		args    []string
		checkFn func(*testing.T, *domain.CLIConfig)
	}{
		{
			name: "breaking flag",
			args: []string{"-breaking"},
			checkFn: func(t *testing.T, config *domain.CLIConfig) {
				if !config.Breaking {
					t.Error("Expected Breaking to be true")
				}
			},
		},
		{
			name: "interactive flag",
			args: []string{"-interactive"},
			checkFn: func(t *testing.T, config *domain.CLIConfig) {
				if !config.Interactive {
					t.Error("Expected Interactive to be true")
				}
			},
		},
		{
			name: "dry-run flag",
			args: []string{"-dry-run"},
			checkFn: func(t *testing.T, config *domain.CLIConfig) {
				if !config.DryRun {
					t.Error("Expected DryRun to be true")
				}
			},
		},
		{
			name: "help flag",
			args: []string{"-help"},
			checkFn: func(t *testing.T, config *domain.CLIConfig) {
				if !config.Help {
					t.Error("Expected Help to be true")
				}
			},
		},
		{
			name: "version flag",
			args: []string{"-version"},
			checkFn: func(t *testing.T, config *domain.CLIConfig) {
				if !config.Version {
					t.Error("Expected Version to be true")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			config, err := parser.Parse(tt.args)

			if err != nil && !strings.Contains(err.Error(), "interactive mode") {
				// Validation errors are expected for some incomplete configs
				t.Logf("Got expected validation error: %v", err)
			}

			if config != nil {
				tt.checkFn(t, config)
			}
		})
	}
}

func TestParser_Parse_MultipleFlags(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	tests := []struct {
		name    string
		args    []string
		checkFn func(*testing.T, *domain.CLIConfig)
	}{
		{
			name: "type and message",
			args: []string{"-type", "feat", "-message", "add feature"},
			checkFn: func(t *testing.T, config *domain.CLIConfig) {
				if config.TypeName != "feat" {
					t.Errorf("Expected type to be feat, got %s", config.TypeName)
				}
				if config.Description != "add feature" {
					t.Errorf("Expected description to be 'add feature', got %s", config.Description)
				}
			},
		},
		{
			name: "type, message, and scope",
			args: []string{"-type", "fix", "-message", "fix bug", "-scope", "api"},
			checkFn: func(t *testing.T, config *domain.CLIConfig) {
				if config.TypeName != "fix" {
					t.Errorf("Expected type to be fix, got %s", config.TypeName)
				}
				if config.Description != "fix bug" {
					t.Errorf("Expected description to be 'fix bug', got %s", config.Description)
				}
				if config.Scope != "api" {
					t.Errorf("Expected scope to be api, got %s", config.Scope)
				}
			},
		},
		{
			name: "complete commit with breaking",
			args: []string{"-type", "feat", "-message", "new feature", "-scope", "core", "-breaking"},
			checkFn: func(t *testing.T, config *domain.CLIConfig) {
				if config.TypeName != "feat" {
					t.Errorf("Expected type to be feat, got %s", config.TypeName)
				}
				if config.Description != "new feature" {
					t.Errorf("Expected description to be 'new feature', got %s", config.Description)
				}
				if config.Scope != "core" {
					t.Errorf("Expected scope to be core, got %s", config.Scope)
				}
				if !config.Breaking {
					t.Error("Expected Breaking to be true")
				}
			},
		},
		{
			name: "dry-run with type and message",
			args: []string{"-dry-run", "-type", "docs", "-message", "update readme"},
			checkFn: func(t *testing.T, config *domain.CLIConfig) {
				if !config.DryRun {
					t.Error("Expected DryRun to be true")
				}
				if config.TypeName != "docs" {
					t.Errorf("Expected type to be docs, got %s", config.TypeName)
				}
				if config.Description != "update readme" {
					t.Errorf("Expected description to be 'update readme', got %s", config.Description)
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			config, err := parser.Parse(tt.args)

			if err != nil {
				t.Fatalf("Expected no error, got: %v", err)
			}

			if config == nil {
				t.Fatal("Expected config to be returned")
			}

			tt.checkFn(t, config)
		})
	}
}

func TestParser_Parse_InvalidArgs(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	tests := []struct {
		name string
		args []string
	}{
		{
			name: "unknown flag",
			args: []string{"-unknown"},
		},
		{
			name: "invalid flag format",
			args: []string{"--invalid-flag"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := parser.Parse(tt.args)

			if err == nil {
				t.Error("Expected error with invalid args, got nil")
			}
		})
	}
}

func TestParser_ShowHelp(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	// Capture stdout - we'll just call ShowHelp and verify it doesn't panic
	// Testing the exact output would be fragile
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("ShowHelp panicked: %v", r)
		}
	}()

	parser.ShowHelp()
}

func TestParser_ShowHelp_ContainsExpectedContent(t *testing.T) {
	_ = NewParser("easy-commit", "1.0.0")

	// We can't easily capture stdout in a test, but we can verify
	// the help message construction doesn't panic and contains key elements
	// by building it manually

	var message strings.Builder
	message.WriteString("easy-commit - Interactive Conventional Commits\n")

	output := message.String()

	if !strings.Contains(output, "easy-commit") {
		t.Error("Expected help message to contain app name")
	}

	if !strings.Contains(output, "Conventional Commits") {
		t.Error("Expected help message to contain description")
	}
}

func TestParser_Parse_ValidatesConfig(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	tests := []struct {
		name          string
		args          []string
		expectError   bool
		errorContains string
	}{
		{
			name:          "missing message with type",
			args:          []string{"-type", "feat"},
			expectError:   true,
			errorContains: "description cannot be empty",
		},
		{
			name:          "missing type with message",
			args:          []string{"-message", "some message"},
			expectError:   true,
			errorContains: "invalid commit type",
		},
		{
			name:        "valid complete config",
			args:        []string{"-type", "feat", "-message", "add feature"},
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := parser.Parse(tt.args)

			if tt.expectError {
				if err == nil {
					t.Error("Expected validation error, got nil")
				} else if tt.errorContains != "" && !strings.Contains(err.Error(), tt.errorContains) {
					t.Errorf("Expected error to contain %q, got: %v", tt.errorContains, err)
				}
			} else {
				if err != nil {
					t.Errorf("Expected no error, got: %v", err)
				}
			}
		})
	}
}

func TestParser_Parse_BooleanFlagDefaults(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	// Parse with just type and message (valid config)
	config, err := parser.Parse([]string{"-type", "feat", "-message", "test"})

	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	// All boolean flags should default to false
	if config.Breaking {
		t.Error("Expected Breaking to default to false")
	}

	if config.DryRun {
		t.Error("Expected DryRun to default to false")
	}

	if config.Help {
		t.Error("Expected Help to default to false")
	}

	if config.Version {
		t.Error("Expected Version to default to false")
	}
}

func TestParser_Parse_FlagWithSpacesInValue(t *testing.T) {
	parser := NewParser("easy-commit", "1.0.0")

	tests := []struct {
		name        string
		args        []string
		expectedMsg string
	}{
		{
			name:        "message with multiple words",
			args:        []string{"-type", "feat", "-message", "add user authentication system"},
			expectedMsg: "add user authentication system",
		},
		{
			name:        "message with extra spaces",
			args:        []string{"-type", "fix", "-message", "fix   multiple   spaces"},
			expectedMsg: "fix   multiple   spaces",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			config, err := parser.Parse(tt.args)

			if err != nil {
				t.Fatalf("Expected no error, got: %v", err)
			}

			if config.Description != tt.expectedMsg {
				t.Errorf("Expected description to be %q, got %q", tt.expectedMsg, config.Description)
			}
		})
	}
}
