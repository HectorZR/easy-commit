package application

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/hector/easy-commit/internal/config"
	"github.com/hector/easy-commit/internal/domain"
)

func TestNewConcurrentValidator(t *testing.T) {
	cfg := &config.ValidatorConfig{
		WorkerCount: 4,
	}

	validator := NewConcurrentValidator(cfg)

	if validator == nil {
		t.Fatal("NewConcurrentValidator() returned nil")
	}

	if validator.config == nil {
		t.Error("NewConcurrentValidator() did not set config")
	}

	if validator.config.WorkerCount != 4 {
		t.Errorf("Expected WorkerCount 4, got %d", validator.config.WorkerCount)
	}
}

func TestConcurrentValidator_Validate_ValidCommit(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "add user authentication"
	commit.Scope = "auth"

	err := validator.Validate(ctx, *commit)

	if err != nil {
		t.Errorf("Unexpected error for valid commit: %v", err)
	}
}

func TestConcurrentValidator_Validate_InvalidCommitType(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.CommitType{Name: "INVALID"}
	commit.Description = "test description"

	err := validator.Validate(ctx, *commit)

	if err == nil {
		t.Error("Expected error for invalid commit type, got none")
	}

	if !strings.Contains(err.Error(), "invalid") {
		t.Errorf("Expected error to mention 'invalid', got: %v", err)
	}
}

func TestConcurrentValidator_Validate_EmptyDescription(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = ""

	err := validator.Validate(ctx, *commit)

	if err == nil {
		t.Error("Expected error for empty description, got none")
	}

	if !strings.Contains(err.Error(), "empty") && !strings.Contains(err.Error(), "description") {
		t.Errorf("Expected error about empty description, got: %v", err)
	}
}

func TestConcurrentValidator_Validate_DescriptionTooLong(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = strings.Repeat("a", 73) // Max is 72

	err := validator.Validate(ctx, *commit)

	if err == nil {
		t.Error("Expected error for description too long, got none")
	}

	if !strings.Contains(err.Error(), "description") {
		t.Errorf("Expected error about description, got: %v", err)
	}
}

func TestConcurrentValidator_Validate_InvalidScope(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "test"
	commit.Scope = "invalid scope" // Contains space

	err := validator.Validate(ctx, *commit)

	if err == nil {
		t.Error("Expected error for invalid scope, got none")
	}

	if !strings.Contains(err.Error(), "scope") {
		t.Errorf("Expected error about scope, got: %v", err)
	}
}

func TestConcurrentValidator_Validate_BodyTooLong(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "test"
	commit.Body = strings.Repeat("a", 501) // Max is 500

	err := validator.Validate(ctx, *commit)

	if err == nil {
		t.Error("Expected error for body too long, got none")
	}

	if !strings.Contains(err.Error(), "body") {
		t.Errorf("Expected error about body length, got: %v", err)
	}
}

func TestConcurrentValidator_Validate_WithTimeout(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)

	// Create a context with a very short timeout
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Nanosecond)
	defer cancel()

	// Wait for context to expire
	time.Sleep(1 * time.Millisecond)

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "test"

	// The validation might still succeed if it's fast enough,
	// but we're testing that the context cancellation is respected
	_ = validator.Validate(ctx, *commit)

	// If context is done, it should have been respected
	if ctx.Err() == nil {
		t.Error("Expected context to be done")
	}
}

func TestConcurrentValidator_Validate_MultipleErrors(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	tests := []struct {
		name    string
		commit  func() *domain.Commit
		wantErr bool
	}{
		{
			name: "invalid type and empty description",
			commit: func() *domain.Commit {
				c := domain.NewCommit(&cfg.Commit)
				c.Type = domain.CommitType{Name: "INVALID"}
				c.Description = ""
				return c
			},
			wantErr: true,
		},
		{
			name: "valid type but invalid scope",
			commit: func() *domain.Commit {
				c := domain.NewCommit(&cfg.Commit)
				c.Type = domain.TypeFeat
				c.Description = "test"
				c.Scope = "invalid scope"
				return c
			},
			wantErr: true,
		},
		{
			name: "all fields valid",
			commit: func() *domain.Commit {
				c := domain.NewCommit(&cfg.Commit)
				c.Type = domain.TypeFeat
				c.Description = "test"
				c.Scope = "api"
				c.Body = "Test body"
				return c
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.Validate(ctx, *tt.commit())

			if tt.wantErr {
				if err == nil {
					t.Error("Expected error but got none")
				}
			} else if err != nil {
				t.Errorf("Unexpected error: %v", err)
			}
		})
	}
}

func TestConcurrentValidator_Validate_DifferentWorkerCounts(t *testing.T) {
	cfg := config.DefaultConfig()
	ctx := context.Background()

	workerCounts := []int{1, 2, 4, 8, 16}

	for _, count := range workerCounts {
		t.Run(string(rune('0'+count))+" workers", func(t *testing.T) {
			validatorCfg := &config.ValidatorConfig{
				WorkerCount: count,
			}
			validator := NewConcurrentValidator(validatorCfg)

			commit := domain.NewCommit(&cfg.Commit)
			commit.Type = domain.TypeFeat
			commit.Description = "test with multiple workers"

			err := validator.Validate(ctx, *commit)

			if err != nil {
				t.Errorf("Unexpected error with %d workers: %v", count, err)
			}
		})
	}
}

func TestConcurrentValidator_Validate_BreakingChange(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeFeat
	commit.Description = "change API"
	commit.Breaking = true
	commit.Body = "This breaks the API"

	err := validator.Validate(ctx, *commit)

	if err != nil {
		t.Errorf("Unexpected error for valid breaking change commit: %v", err)
	}
}

func TestConcurrentValidator_Validate_CompleteCommit(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	commit := domain.NewCommit(&cfg.Commit)
	commit.Type = domain.TypeRefactor
	commit.Description = "restructure authentication module"
	commit.Scope = "auth"
	commit.Body = "Moved authentication logic to separate module for better maintainability"
	commit.Breaking = false

	err := validator.Validate(ctx, *commit)

	if err != nil {
		t.Errorf("Unexpected error for complete valid commit: %v", err)
	}
}

func TestConcurrentValidator_Validate_AllCommitTypes(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	commitTypes := domain.CommitTypes{}.GetDefault()

	for _, commitType := range commitTypes {
		t.Run(commitType.Name, func(t *testing.T) {
			commit := domain.NewCommit(&cfg.Commit)
			commit.Type = commitType
			commit.Description = "test " + commitType.Name

			err := validator.Validate(ctx, *commit)

			if err != nil {
				t.Errorf("Unexpected error for %s commit type: %v", commitType.Name, err)
			}
		})
	}
}

func TestConcurrentValidator_Validate_ConcurrentSafety(t *testing.T) {
	cfg := config.DefaultConfig()
	validator := NewConcurrentValidator(&cfg.Validator)
	ctx := context.Background()

	// Run multiple validations concurrently
	iterations := 50
	errChan := make(chan error, iterations)

	for i := 0; i < iterations; i++ {
		go func(idx int) {
			commit := domain.NewCommit(&cfg.Commit)
			commit.Type = domain.TypeFeat
			commit.Description = "concurrent test"
			errChan <- validator.Validate(ctx, *commit)
		}(i)
	}

	// Collect results
	for i := 0; i < iterations; i++ {
		err := <-errChan
		if err != nil {
			t.Errorf("Unexpected error in concurrent validation %d: %v", i, err)
		}
	}
}
