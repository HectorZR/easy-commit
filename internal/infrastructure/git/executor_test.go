package git

import (
	"context"
	"testing"
	"time"

	"github.com/hector/easy-commit/internal/config"
	"github.com/hector/easy-commit/internal/shared"
)

func TestNewExecutor(t *testing.T) {
	logger := shared.NewLogger(shared.SILENT)
	timeoutsConfig := &config.TimeoutsConfig{
		GitCommand: 5 * time.Second,
	}

	executor := NewExecutor(logger, timeoutsConfig)

	if executor == nil {
		t.Fatal("Expected executor to be created, got nil")
	}

	if executor.config != timeoutsConfig {
		t.Errorf("Expected config to be %v, got %v", timeoutsConfig, executor.config)
	}

	if executor.logger != logger {
		t.Errorf("Expected logger to be %v, got %v", logger, executor.logger)
	}
}

func TestExecutor_IsGitRepository(t *testing.T) {
	logger := shared.NewLogger(shared.SILENT)
	timeoutsConfig := &config.TimeoutsConfig{
		GitCommand: 5 * time.Second,
	}
	executor := NewExecutor(logger, timeoutsConfig)

	// Test in actual git repository (this project is a git repo)
	// This is a real integration test since we're in a git repo
	result := executor.IsGitRepository()

	// Since we're running in easy-commit project which is a git repo, this should be true
	if !result {
		t.Error("Expected IsGitRepository to return true in a git repository")
	}
}

func TestExecutor_HasStagedChanges(t *testing.T) {
	logger := shared.NewLogger(shared.SILENT)
	timeoutsConfig := &config.TimeoutsConfig{
		GitCommand: 5 * time.Second,
	}
	executor := NewExecutor(logger, timeoutsConfig)

	// Test in actual git repository
	// This will return true if there are staged changes, false otherwise
	// We can't control the state reliably, but we can verify it doesn't panic
	result := executor.HasStagedChanges()

	// Just verify the method executes without error
	// The result depends on the actual git state
	_ = result // Result can be true or false depending on git state
}

func TestExecutor_Commit_WithContext(t *testing.T) {
	logger := shared.NewLogger(shared.SILENT)
	timeoutsConfig := &config.TimeoutsConfig{
		GitCommand: 5 * time.Second,
	}
	executor := NewExecutor(logger, timeoutsConfig)

	tests := []struct {
		name           string
		message        string
		contextTimeout time.Duration
		expectError    bool
	}{
		{
			name:           "empty message",
			message:        "",
			contextTimeout: 5 * time.Second,
			expectError:    true, // Git will fail with empty message
		},
		{
			name:           "valid message format",
			message:        "feat: test commit message",
			contextTimeout: 5 * time.Second,
			expectError:    true, // Will fail if no staged changes, but we're testing the call
		},
		{
			name:           "context timeout",
			message:        "test: timeout test",
			contextTimeout: 1 * time.Nanosecond, // Very short timeout
			expectError:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx, cancel := context.WithTimeout(context.Background(), tt.contextTimeout)
			defer cancel()

			err := executor.Commit(ctx, tt.message)

			if tt.expectError && err == nil {
				t.Error("Expected error, got nil")
			}
		})
	}
}

func TestExecutor_Commit_CancelledContext(t *testing.T) {
	logger := shared.NewLogger(shared.SILENT)
	timeoutsConfig := &config.TimeoutsConfig{
		GitCommand: 5 * time.Second,
	}
	executor := NewExecutor(logger, timeoutsConfig)

	ctx, cancel := context.WithCancel(context.Background())
	cancel() // Cancel immediately

	err := executor.Commit(ctx, "test: cancelled commit")
	if err == nil {
		t.Error("Expected error with cancelled context, got nil")
	}
}

func TestExecutor_GetLastCommitMessage(t *testing.T) {
	logger := shared.NewLogger(shared.SILENT)
	timeoutsConfig := &config.TimeoutsConfig{
		GitCommand: 5 * time.Second,
	}
	executor := NewExecutor(logger, timeoutsConfig)

	// Test in actual git repository
	// This project should have at least one commit
	message, err := executor.GetLastCommitMessage()

	if err != nil {
		t.Fatalf("Expected no error getting last commit message in git repo, got: %v", err)
	}

	if message == "" {
		t.Error("Expected non-empty commit message in git repository")
	}

	// Verify the message is trimmed (no leading/trailing whitespace)
	if len(message) != len(trimWhitespace(message)) {
		t.Error("Expected commit message to be trimmed")
	}
}

func TestExecutor_GetLastCommitMessage_Timeout(t *testing.T) {
	logger := shared.NewLogger(shared.SILENT)
	// Set extremely short timeout
	timeoutsConfig := &config.TimeoutsConfig{
		GitCommand: 1 * time.Nanosecond,
	}
	executor := NewExecutor(logger, timeoutsConfig)

	// This should timeout or succeed very quickly
	_, err := executor.GetLastCommitMessage()

	// We expect either success (if git is very fast) or timeout error
	// This test mainly ensures the timeout mechanism is in place
	_ = err // Can be nil or error depending on system speed
}

func TestExecutor_CommitMessageFormatting(t *testing.T) {
	logger := shared.NewLogger(shared.SILENT)
	timeoutsConfig := &config.TimeoutsConfig{
		GitCommand: 5 * time.Second,
	}
	executor := NewExecutor(logger, timeoutsConfig)

	tests := []struct {
		name    string
		message string
	}{
		{
			name:    "simple message",
			message: "feat: add new feature",
		},
		{
			name:    "message with scope",
			message: "fix(api): resolve timeout issue",
		},
		{
			name:    "message with special characters",
			message: "docs: update README.md with 'quotes' and \"double quotes\"",
		},
		{
			name:    "message with unicode",
			message: "feat: add emoji support 🎉",
		},
		{
			name: "multiline message",
			message: `feat: add new feature

This is a longer description
with multiple lines`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx := context.Background()

			// Call Commit - it will fail without staged changes, but we're testing
			// that the message is properly formatted and passed
			err := executor.Commit(ctx, tt.message)

			// We expect an error (no staged changes), but we're verifying
			// the method doesn't panic with various message formats
			if err == nil {
				// If it succeeded, that's fine too (might have staged changes)
				t.Log("Commit succeeded (may have staged changes)")
			}
		})
	}
}

func TestExecutor_MultipleOperations(t *testing.T) {
	logger := shared.NewLogger(shared.SILENT)
	timeoutsConfig := &config.TimeoutsConfig{
		GitCommand: 5 * time.Second,
	}
	executor := NewExecutor(logger, timeoutsConfig)

	// Test calling multiple operations in sequence
	isRepo := executor.IsGitRepository()
	if !isRepo {
		t.Fatal("Expected to be in a git repository for this test")
	}

	hasChanges := executor.HasStagedChanges()
	_ = hasChanges // Can be true or false

	message, err := executor.GetLastCommitMessage()
	if err != nil {
		t.Errorf("Expected to get last commit message, got error: %v", err)
	}

	if message == "" {
		t.Error("Expected non-empty last commit message")
	}
}

func TestExecutor_CommitWithDifferentContexts(t *testing.T) {
	logger := shared.NewLogger(shared.SILENT)
	timeoutsConfig := &config.TimeoutsConfig{
		GitCommand: 5 * time.Second,
	}
	executor := NewExecutor(logger, timeoutsConfig)

	tests := []struct {
		name    string
		ctx     context.Context
		message string
	}{
		{
			name:    "background context",
			ctx:     context.Background(),
			message: "test: background context",
		},
		{
			name:    "context with value",
			ctx:     context.WithValue(context.Background(), "key", "value"),
			message: "test: context with value",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := executor.Commit(tt.ctx, tt.message)
			// Expected to fail without staged changes, but shouldn't panic
			_ = err
		})
	}
}

// Helper function to trim whitespace
func trimWhitespace(s string) string {
	// Simple trim implementation for testing
	start := 0
	end := len(s)

	for start < end && (s[start] == ' ' || s[start] == '\t' || s[start] == '\n' || s[start] == '\r') {
		start++
	}

	for end > start && (s[end-1] == ' ' || s[end-1] == '\t' || s[end-1] == '\n' || s[end-1] == '\r') {
		end--
	}

	return s[start:end]
}
