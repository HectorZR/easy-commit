package domain_test

import (
	"errors"
	"strings"
	"testing"

	"github.com/hector/easy-commit/internal/domain"
)

func TestCommit_Validate(t *testing.T) {
	tests := []struct {
		name    string
		commit  domain.Commit
		wantErr bool
		errType error
	}{
		{
			name: "valid commit",
			commit: domain.Commit{
				Type:        domain.TypeFeat,
				Description: "add user authentication",
				Scope:       "auth",
			},
			wantErr: false,
		},
		{
			name: "empty description",
			commit: domain.Commit{
				Type:        domain.TypeFeat,
				Description: "",
			},
			wantErr: true,
			errType: domain.ErrEmptyDescription,
		},
		{
			name: "description too long",
			commit: domain.Commit{
				Type:        domain.TypeFeat,
				Description: strings.Repeat("a", 51),
			},
			wantErr: true,
			errType: domain.ErrDescriptionTooLong,
		},
		{
			name: "Invalid scope format",
			commit: domain.Commit{
				Type:        domain.TypeFeat,
				Description: "some description",
				Scope:       "invalid scope",
			},
			wantErr: true,
			errType: domain.ErrInvalidScopeFormat,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.commit.Validate()
			if tt.wantErr {
				if err == nil {
					t.Errorf("Expected error but got none")
					return
				}

				if tt.errType != nil && !errors.Is(err, tt.errType) {
					t.Errorf("Expected error type %v, got %v", tt.errType, err)
				}
			} else if err != nil {
				t.Errorf("Unexpected error: %v", err)
			}
		})
	}
}

func TestCommit_Format(t *testing.T) {
	tests := []struct {
		name     string
		commit   domain.Commit
		expected string
	}{
		{
			name: "simple commit",
			commit: domain.Commit{
				Type:        domain.TypeFeat,
				Description: "add user login",
			},
			expected: "feat: add user login",
		},
		{
			name: "commit with scope",
			commit: domain.Commit{
				Type:        domain.TypeFix,
				Description: "fix login bug",
				Scope:       "auth",
			},
			expected: "fix(auth): fix login bug",
		},
		{
			name: "breaking change",
			commit: domain.Commit{
				Type:        domain.TypeFeat,
				Description: "update API endpoint",
				Breaking:    true,
				Body:        "body content",
			},
			expected: "feat!: update API endpoint\n\nbody content\n\nBREAKING CHANGE: This commit introduces a breaking change.",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.commit.Format()
			if result != tt.expected {
				t.Errorf("Expected %q, got %q", tt.expected, result)
			}
		})
	}
}

func TestTypes_isValid(t *testing.T) {
	tests := []struct {
		name  string
		ct    domain.CommitType
		valid bool
	}{
		{
			name:  "valid type name",
			ct:    domain.CommitType{Name: "feat"},
			valid: true,
		},
		{
			name:  "empty type name",
			ct:    domain.CommitType{Name: ""},
			valid: false,
		},
		{
			name:  "type name with uppercase letters",
			ct:    domain.CommitType{Name: "Feat"},
			valid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.ct.IsValid() != tt.valid {
				t.Errorf("Expected validity %v, got %v", tt.valid, tt.ct.IsValid())
			}
		})
	}
}

func TestTypes_GetByName(t *testing.T) {
	tests := []struct {
		name     string
		cts      domain.CommitTypes
		input    string
		expected domain.CommitType
		wantErr  bool
	}{
		{
			name: "existing type",
			cts: domain.CommitTypes{
				domain.TypeFeat,
				domain.TypeFix,
			},
			input:    "feat",
			expected: domain.TypeFeat,
			wantErr:  false,
		},
		{
			name: "non-existing type",
			cts: domain.CommitTypes{
				domain.TypeFeat,
				domain.TypeFix,
			},
			input:   "docs",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := tt.cts.GetByName(tt.input)
			if tt.wantErr {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
			} else {
				if err != nil {
					t.Errorf("Unexpected error: %v", err)
				}
				if result != tt.expected {
					t.Errorf("Expected %v, got %v", tt.expected, result)
				}
			}
		})
	}
}

func TestCLIConfig_IsInteractive(t *testing.T) {
	tests := []struct {
		name     string
		config   domain.CLIConfig
		expected bool
	}{
		{
			name: "explicit interactive flag",
			config: domain.CLIConfig{
				Interactive: true,
				TypeName:    "feat",
				Description: "some description",
			},
			expected: true,
		},
		{
			name: "empty type and description",
			config: domain.CLIConfig{
				Interactive: false,
				TypeName:    "",
				Description: "",
			},
			expected: true,
		},
		{
			name: "only empty type",
			config: domain.CLIConfig{
				Interactive: false,
				TypeName:    "",
				Description: "some description",
			},
			expected: false,
		},
		{
			name: "only empty description",
			config: domain.CLIConfig{
				Interactive: false,
				TypeName:    "feat",
				Description: "",
			},
			expected: false,
		},
		{
			name: "both type and description provided",
			config: domain.CLIConfig{
				Interactive: false,
				TypeName:    "feat",
				Description: "add new feature",
			},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.config.IsInteractive()
			if result != tt.expected {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestCLIConfig_Validate(t *testing.T) {
	tests := []struct {
		name    string
		config  domain.CLIConfig
		wantErr bool
		errType error
	}{
		{
			name: "help flag - should not validate",
			config: domain.CLIConfig{
				Help: true,
			},
			wantErr: false,
		},
		{
			name: "version flag - should not validate",
			config: domain.CLIConfig{
				Version: true,
			},
			wantErr: false,
		},
		{
			name: "interactive mode - should not validate",
			config: domain.CLIConfig{
				Interactive: true,
			},
			wantErr: false,
		},
		{
			name: "non-interactive with valid data",
			config: domain.CLIConfig{
				Interactive: false,
				TypeName:    "feat",
				Description: "add new feature",
			},
			wantErr: false,
		},
		{
			name: "non-interactive without type",
			config: domain.CLIConfig{
				Interactive: false,
				TypeName:    "",
				Description: "add new feature",
			},
			wantErr: true,
			errType: domain.ErrInvalidCommitType,
		},
		{
			name: "non-interactive without description",
			config: domain.CLIConfig{
				Interactive: false,
				TypeName:    "feat",
				Description: "",
			},
			wantErr: true,
			errType: domain.ErrEmptyDescription,
		},
		{
			name: "non-interactive with whitespace-only description",
			config: domain.CLIConfig{
				Interactive: false,
				TypeName:    "feat",
				Description: "   \t\n   ",
			},
			wantErr: true,
			errType: domain.ErrEmptyDescription,
		},
		{
			name: "empty type and description triggers interactive",
			config: domain.CLIConfig{
				Interactive: false,
				TypeName:    "",
				Description: "",
			},
			wantErr: false, // Should be considered interactive
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.config.Validate()
			if tt.wantErr {
				if err == nil {
					t.Errorf("Expected error but got none")
					return
				}

				if tt.errType != nil && !errors.Is(err, tt.errType) {
					t.Errorf("Expected error type %v, got %v", tt.errType, err)
				}
			} else if err != nil {
				t.Errorf("Unexpected error: %v", err)
			}
		})
	}
}

func TestCLIConfig_ToCommit(t *testing.T) {
	tests := []struct {
		name           string
		config         domain.CLIConfig
		wantErr        bool
		errType        error
		expectNil      bool
		validateCommit func(*testing.T, *domain.Commit)
	}{
		{
			name: "valid config with feat type",
			config: domain.CLIConfig{
				TypeName:    "feat",
				Description: "add user authentication",
				Scope:       "auth",
				Body:        "Implement JWT-based authentication",
				Breaking:    false,
			},
			wantErr:   false,
			expectNil: false,
			validateCommit: func(t *testing.T, c *domain.Commit) {
				if c.Type.Name != "feat" {
					t.Errorf("Expected type 'feat', got '%s'", c.Type.Name)
				}
				if c.Description != "add user authentication" {
					t.Errorf("Expected description 'add user authentication', got '%s'", c.Description)
				}
				if c.Scope != "auth" {
					t.Errorf("Expected scope 'auth', got '%s'", c.Scope)
				}
				if c.Body != "Implement JWT-based authentication" {
					t.Errorf("Expected body 'Implement JWT-based authentication', got '%s'", c.Body)
				}
				if c.Breaking != false {
					t.Errorf("Expected Breaking to be false, got %v", c.Breaking)
				}
			},
		},
		{
			name: "valid config with breaking change",
			config: domain.CLIConfig{
				TypeName:    "fix",
				Description: "update API response format",
				Breaking:    true,
			},
			wantErr:   false,
			expectNil: false,
			validateCommit: func(t *testing.T, c *domain.Commit) {
				if c.Type.Name != "fix" {
					t.Errorf("Expected type 'fix', got '%s'", c.Type.Name)
				}
				if c.Breaking != true {
					t.Errorf("Expected Breaking to be true, got %v", c.Breaking)
				}
			},
		},
		{
			name: "empty type name",
			config: domain.CLIConfig{
				TypeName:    "",
				Description: "some description",
			},
			wantErr:   true,
			errType:   domain.ErrInvalidCommitType,
			expectNil: true,
		},
		{
			name: "invalid commit type",
			config: domain.CLIConfig{
				TypeName:    "invalid",
				Description: "some description",
			},
			wantErr:   true,
			errType:   domain.ErrInvalidCommitType,
			expectNil: true,
		},
		{
			name: "empty description should fail validation",
			config: domain.CLIConfig{
				TypeName:    "feat",
				Description: "",
			},
			wantErr:   true,
			errType:   domain.ErrEmptyDescription,
			expectNil: false, // ToCommit creates the commit first, then validates
		},
		{
			name: "description too long should fail validation",
			config: domain.CLIConfig{
				TypeName:    "feat",
				Description: strings.Repeat("a", 51), // Max is 50
			},
			wantErr:   true,
			errType:   domain.ErrDescriptionTooLong,
			expectNil: false, // ToCommit creates the commit first, then validates
		},
		{
			name: "invalid scope format should fail validation",
			config: domain.CLIConfig{
				TypeName:    "feat",
				Description: "valid description",
				Scope:       "invalid scope", // Contains space
			},
			wantErr:   true,
			errType:   domain.ErrInvalidScopeFormat,
			expectNil: false, // ToCommit creates the commit first, then validates
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// We need to use the default types for the lookup to work
			// Since GetByName is called on an empty CommitTypes slice in the current implementation,
			// this will always fail. We should test against the default types.
			// Let's patch the config to use a proper method or test what we have.

			commit, err := tt.config.ToCommit()

			if tt.wantErr {
				if err == nil {
					t.Errorf("Expected error but got none")
					return
				}

				if tt.errType != nil && !errors.Is(err, tt.errType) {
					t.Errorf("Expected error type %v, got %v", tt.errType, err)
				}

				if tt.expectNil && commit != nil {
					t.Errorf("Expected nil commit but got %+v", commit)
				}
			} else {
				if err != nil {
					t.Errorf("Unexpected error: %v", err)
					return
				}

				if commit == nil {
					t.Errorf("Expected commit but got nil")
					return
				}

				if tt.validateCommit != nil {
					tt.validateCommit(t, commit)
				}
			}
		})
	}
}
