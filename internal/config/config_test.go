package config

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestDefaultConfig(t *testing.T) {
	cfg := DefaultConfig()

	if cfg == nil {
		t.Fatal("DefaultConfig() returned nil")
	}

	// Test Commit config
	if cfg.Commit.MaxDescriptionLength != 72 {
		t.Errorf("Expected MaxDescriptionLength 72, got %d", cfg.Commit.MaxDescriptionLength)
	}

	if cfg.Commit.MaxBodyLineLength != 72 {
		t.Errorf("Expected MaxBodyLineLength 72, got %d", cfg.Commit.MaxBodyLineLength)
	}

	if cfg.Commit.MaxBodyLength != 500 {
		t.Errorf("Expected MaxBodyLength 500, got %d", cfg.Commit.MaxBodyLength)
	}

	if cfg.Commit.InvalidScopeChars != " \t\n()" {
		t.Errorf("Expected InvalidScopeChars ' \\t\\n()', got %q", cfg.Commit.InvalidScopeChars)
	}

	// Test Timeouts config
	if cfg.Timeouts.Validation != 2*time.Second {
		t.Errorf("Expected Validation timeout 2s, got %v", cfg.Timeouts.Validation)
	}

	if cfg.Timeouts.UserInput != 30*time.Second {
		t.Errorf("Expected UserInput timeout 30s, got %v", cfg.Timeouts.UserInput)
	}

	if cfg.Timeouts.GitCommand != 5*time.Second {
		t.Errorf("Expected GitCommand timeout 5s, got %v", cfg.Timeouts.GitCommand)
	}

	if cfg.Timeouts.Context != 5*time.Minute {
		t.Errorf("Expected Context timeout 5m, got %v", cfg.Timeouts.Context)
	}

	// Test Validator config
	if cfg.Validator.WorkerCount != 4 {
		t.Errorf("Expected WorkerCount 4, got %d", cfg.Validator.WorkerCount)
	}

	// Test Logger config
	if cfg.Logger.Level != "INFO" {
		t.Errorf("Expected Logger level 'INFO', got %q", cfg.Logger.Level)
	}
}

func TestLoadOrDefault_NoConfigFile(t *testing.T) {
	// Create a temporary directory
	tmpDir, err := os.MkdirTemp("", "easy-commit-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	// Change to temp directory
	origDir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		if err := os.Chdir(origDir); err != nil {
			t.Errorf("Failed to restore directory: %v", err)
		}
	}()

	if err := os.Chdir(tmpDir); err != nil {
		t.Fatal(err)
	}

	// Should return default config when no file exists
	cfg := LoadOrDefault()

	if cfg == nil {
		t.Fatal("LoadOrDefault() returned nil")
	}

	if cfg.Commit.MaxDescriptionLength != 72 {
		t.Errorf("Expected default MaxDescriptionLength 72, got %d", cfg.Commit.MaxDescriptionLength)
	}
}

func TestLoad_ValidYAMLFile(t *testing.T) {
	// Create a temporary directory
	tmpDir, err := os.MkdirTemp("", "easy-commit-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	// Create a test config file
	configContent := `commit:
  max_description_length: 100
  max_body_line_length: 80
  max_body_length: 1000
  invalid_scope_chars: " \t\n"

timeouts:
  validation: 5s
  user_input: 60s
  git_command: 10s
  context: 10m

validator:
  worker_count: 8

logger:
  level: DEBUG
`

	configPath := filepath.Join(tmpDir, ".easy-commit.yaml")
	if err := os.WriteFile(configPath, []byte(configContent), 0644); err != nil {
		t.Fatal(err)
	}

	// Change to temp directory
	origDir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		if err := os.Chdir(origDir); err != nil {
			t.Errorf("Failed to restore directory: %v", err)
		}
	}()

	if err := os.Chdir(tmpDir); err != nil {
		t.Fatal(err)
	}

	// Load config
	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() returned error: %v", err)
	}

	if cfg == nil {
		t.Fatal("Load() returned nil config")
	}

	// Verify custom values
	if cfg.Commit.MaxDescriptionLength != 100 {
		t.Errorf("Expected MaxDescriptionLength 100, got %d", cfg.Commit.MaxDescriptionLength)
	}

	if cfg.Timeouts.Validation != 5*time.Second {
		t.Errorf("Expected Validation timeout 5s, got %v", cfg.Timeouts.Validation)
	}

	if cfg.Validator.WorkerCount != 8 {
		t.Errorf("Expected WorkerCount 8, got %d", cfg.Validator.WorkerCount)
	}

	if cfg.Logger.Level != "DEBUG" {
		t.Errorf("Expected Logger level 'DEBUG', got %q", cfg.Logger.Level)
	}
}

func TestLoad_PartialConfig(t *testing.T) {
	// Create a temporary directory
	tmpDir, err := os.MkdirTemp("", "easy-commit-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	// Create a partial config file (only override some values)
	configContent := `commit:
  max_description_length: 150

logger:
  level: ERROR
`

	configPath := filepath.Join(tmpDir, ".easy-commit.yaml")
	if err := os.WriteFile(configPath, []byte(configContent), 0644); err != nil {
		t.Fatal(err)
	}

	// Change to temp directory
	origDir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		if err := os.Chdir(origDir); err != nil {
			t.Errorf("Failed to restore directory: %v", err)
		}
	}()

	if err := os.Chdir(tmpDir); err != nil {
		t.Fatal(err)
	}

	// Load config
	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() returned error: %v", err)
	}

	// Verify custom values
	if cfg.Commit.MaxDescriptionLength != 150 {
		t.Errorf("Expected MaxDescriptionLength 150, got %d", cfg.Commit.MaxDescriptionLength)
	}

	if cfg.Logger.Level != "ERROR" {
		t.Errorf("Expected Logger level 'ERROR', got %q", cfg.Logger.Level)
	}

	// Verify defaults are still used for non-specified values
	if cfg.Commit.MaxBodyLength != 500 {
		t.Errorf("Expected default MaxBodyLength 500, got %d", cfg.Commit.MaxBodyLength)
	}

	if cfg.Validator.WorkerCount != 4 {
		t.Errorf("Expected default WorkerCount 4, got %d", cfg.Validator.WorkerCount)
	}
}

func TestLoad_InvalidYAML(t *testing.T) {
	// Create a temporary directory
	tmpDir, err := os.MkdirTemp("", "easy-commit-test-*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	// Create an invalid YAML file
	configContent := `commit:
  max_description_length: not_a_number
  invalid yaml content {{{}
`

	configPath := filepath.Join(tmpDir, ".easy-commit.yaml")
	if err := os.WriteFile(configPath, []byte(configContent), 0644); err != nil {
		t.Fatal(err)
	}

	// Change to temp directory
	origDir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	defer func() {
		if err := os.Chdir(origDir); err != nil {
			t.Errorf("Failed to restore directory: %v", err)
		}
	}()

	if err := os.Chdir(tmpDir); err != nil {
		t.Fatal(err)
	}

	// LoadOrDefault should return defaults even with invalid YAML
	cfg := LoadOrDefault()

	if cfg == nil {
		t.Fatal("LoadOrDefault() returned nil")
	}

	// Should have default values
	if cfg.Commit.MaxDescriptionLength != 72 {
		t.Errorf("Expected default MaxDescriptionLength 72, got %d", cfg.Commit.MaxDescriptionLength)
	}
}
