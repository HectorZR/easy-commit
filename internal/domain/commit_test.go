package domain

import (
	"strings"
	"testing"

	"github.com/hector/easy-commit/internal/config"
	"github.com/hector/easy-commit/internal/shared"
)

func TestNewCommit(t *testing.T) {
	cfg := config.DefaultConfig()

	commit := NewCommit(&cfg.Commit)

	if commit == nil {
		t.Fatal("NewCommit() returned nil")
	}

	if commit.config == nil {
		t.Error("NewCommit() did not set config")
	}

	if commit.config.MaxDescriptionLength != cfg.Commit.MaxDescriptionLength {
		t.Errorf("Expected MaxDescriptionLength %d, got %d", cfg.Commit.MaxDescriptionLength, commit.config.MaxDescriptionLength)
	}
}

func TestCommit_ValidateDescription(t *testing.T) {
	cfg := config.DefaultConfig()

	tests := []struct {
		name        string
		description string
		wantErr     bool
		errContains string
	}{
		{
			name:        "valid description",
			description: "add user authentication",
			wantErr:     false,
		},
		{
			name:        "empty description",
			description: "",
			wantErr:     true,
			errContains: "empty",
		},
		{
			name:        "whitespace only description",
			description: "   \t\n   ",
			wantErr:     true,
			errContains: "empty",
		},
		{
			name:        "description at max length (72 chars)",
			description: strings.Repeat("a", 72),
			wantErr:     false,
		},
		{
			name:        "description too long (73 chars)",
			description: strings.Repeat("a", 73),
			wantErr:     true,
			errContains: "exceeds maximum length",
		},
		{
			name:        "description with unicode characters",
			description: "añadir autenticación de usuario 你好",
			wantErr:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := NewCommit(&cfg.Commit)
			c.Type = TypeFeat
			c.Description = tt.description

			err := c.validateDescription()

			if tt.wantErr {
				if err == nil {
					t.Error("Expected error but got none")
					return
				}
				if tt.errContains != "" && !strings.Contains(err.Error(), tt.errContains) {
					t.Errorf("Expected error to contain %q, got: %v", tt.errContains, err)
				}
			} else if err != nil {
				t.Errorf("Unexpected error: %v", err)
			}
		})
	}
}

func TestCommit_ValidateScope(t *testing.T) {
	cfg := config.DefaultConfig()

	tests := []struct {
		name    string
		scope   string
		wantErr bool
	}{
		{
			name:    "empty scope (valid)",
			scope:   "",
			wantErr: false,
		},
		{
			name:    "simple scope",
			scope:   "api",
			wantErr: false,
		},
		{
			name:    "scope with hyphen",
			scope:   "api-client",
			wantErr: false,
		},
		{
			name:    "scope with underscore",
			scope:   "api_client",
			wantErr: false,
		},
		{
			name:    "scope with space (invalid)",
			scope:   "api client",
			wantErr: true,
		},
		{
			name:    "scope with parentheses (invalid)",
			scope:   "api()",
			wantErr: true,
		},
		{
			name:    "scope with leading/trailing whitespace (invalid)",
			scope:   " api ",
			wantErr: true,
		},
		{
			name:    "scope with tab (invalid)",
			scope:   "api\tclient",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := NewCommit(&cfg.Commit)
			c.Scope = tt.scope

			err := c.validateScope()

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

func TestCommit_ValidateBody(t *testing.T) {
	cfg := config.DefaultConfig()

	tests := []struct {
		name    string
		body    string
		wantErr bool
	}{
		{
			name:    "empty body (valid)",
			body:    "",
			wantErr: false,
		},
		{
			name:    "short body",
			body:    "This is a simple commit body.",
			wantErr: false,
		},
		{
			name:    "body at max length (500 chars)",
			body:    strings.Repeat("a", 500),
			wantErr: false,
		},
		{
			name:    "body too long (501 chars)",
			body:    strings.Repeat("a", 501),
			wantErr: true,
		},
		{
			name:    "multiline body",
			body:    "Line 1\nLine 2\nLine 3",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := NewCommit(&cfg.Commit)
			c.Body = tt.body

			err := c.validateBody()

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

func TestCommit_Validate(t *testing.T) {
	cfg := config.DefaultConfig()

	tests := []struct {
		name    string
		commit  func() *Commit
		wantErr bool
	}{
		{
			name: "complete valid commit",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = "add user authentication"
				c.Scope = "auth"
				c.Body = "Implemented JWT-based authentication"
				c.Breaking = false
				return c
			},
			wantErr: false,
		},
		{
			name: "minimal valid commit",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFix
				c.Description = "resolve bug"
				return c
			},
			wantErr: false,
		},
		{
			name: "invalid type",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = CommitType{Name: "INVALID"}
				c.Description = "test"
				return c
			},
			wantErr: true,
		},
		{
			name: "empty description",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = ""
				return c
			},
			wantErr: true,
		},
		{
			name: "invalid scope",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = "test"
				c.Scope = "invalid scope"
				return c
			},
			wantErr: true,
		},
		{
			name: "body too long",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = "test"
				c.Body = strings.Repeat("a", 501)
				return c
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.commit().Validate()

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

func TestCommit_Format(t *testing.T) {
	cfg := config.DefaultConfig()

	tests := []struct {
		name     string
		commit   func() *Commit
		expected string
	}{
		{
			name: "simple commit",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = "add user login"
				return c
			},
			expected: "feat: add user login",
		},
		{
			name: "commit with scope",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFix
				c.Description = "fix login bug"
				c.Scope = "auth"
				return c
			},
			expected: "fix(auth): fix login bug",
		},
		{
			name: "commit with body",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = "add feature"
				c.Body = "This is the body"
				return c
			},
			expected: "feat: add feature\n\nThis is the body",
		},
		{
			name: "breaking change without body",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = "update API"
				c.Breaking = true
				return c
			},
			expected: "feat!: update API\n\nBREAKING CHANGE: ",
		},
		{
			name: "breaking change with body",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = "update API endpoint"
				c.Body = "Changed the response format"
				c.Breaking = true
				return c
			},
			expected: "feat!: update API endpoint\n\nChanged the response format\n\nBREAKING CHANGE: This commit introduces a breaking change.",
		},
		{
			name: "complete commit",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeRefactor
				c.Description = "restructure codebase"
				c.Scope = "core"
				c.Body = "Moved files to new structure"
				c.Breaking = false
				return c
			},
			expected: "refactor(core): restructure codebase\n\nMoved files to new structure",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.commit().Format()
			if result != tt.expected {
				t.Errorf("Expected:\n%s\n\nGot:\n%s", tt.expected, result)
			}
		})
	}
}

func TestCommit_FormatBody(t *testing.T) {
	cfg := config.DefaultConfig()

	tests := []struct {
		name     string
		body     string
		expected string
	}{
		{
			name:     "empty body",
			body:     "",
			expected: "",
		},
		{
			name:     "single line under limit",
			body:     "This is a short line",
			expected: "This is a short line",
		},
		{
			name:     "multiple lines under limit",
			body:     "Line 1\nLine 2\nLine 3",
			expected: "Line 1\nLine 2\nLine 3",
		},
		{
			name:     "long line that needs wrapping",
			body:     strings.Repeat("word ", 30), // Creates a very long line
			expected: strings.Repeat("word ", 30), // formatBody should handle wrapping
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := NewCommit(&cfg.Commit)
			c.Body = tt.body

			result := c.formatBody()

			// For wrapping test, just check it's not empty and has newlines if needed
			if tt.body != "" && len(tt.body) > cfg.Commit.MaxBodyLineLength {
				if result == "" {
					t.Error("Expected formatted body but got empty string")
				}
				// Check that lines don't exceed max length
				lines := strings.Split(result, "\n")
				for i, line := range lines {
					if len(line) > cfg.Commit.MaxBodyLineLength {
						t.Errorf("Line %d exceeds max length: %d > %d", i, len(line), cfg.Commit.MaxBodyLineLength)
					}
				}
			} else if result != tt.expected {
				t.Errorf("Expected: %q, got: %q", tt.expected, result)
			}
		})
	}
}

func TestCommit_IsBreaking(t *testing.T) {
	cfg := config.DefaultConfig()

	tests := []struct {
		name     string
		breaking bool
		expected bool
	}{
		{
			name:     "breaking change",
			breaking: true,
			expected: true,
		},
		{
			name:     "not breaking change",
			breaking: false,
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := NewCommit(&cfg.Commit)
			c.Breaking = tt.breaking

			result := c.IsBreaking()

			if result != tt.expected {
				t.Errorf("Expected IsBreaking() = %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestCommit_HasScope(t *testing.T) {
	cfg := config.DefaultConfig()

	tests := []struct {
		name     string
		scope    string
		expected bool
	}{
		{
			name:     "with scope",
			scope:    "api",
			expected: true,
		},
		{
			name:     "without scope",
			scope:    "",
			expected: false,
		},
		{
			name:     "whitespace only scope",
			scope:    "   ",
			expected: false,
		},
		{
			name:     "scope with content and spaces",
			scope:    "  api  ",
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := NewCommit(&cfg.Commit)
			c.Scope = tt.scope

			result := c.HasScope()

			if result != tt.expected {
				t.Errorf("Expected HasScope() = %v for scope %q, got %v", tt.expected, tt.scope, result)
			}
		})
	}
}

func TestCommit_ValidateWithDifferentErrors(t *testing.T) {
	cfg := config.DefaultConfig()

	tests := []struct {
		name     string
		commit   func() *Commit
		errCheck func(error) bool
	}{
		{
			name: "ErrInvalidCommitType",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = CommitType{Name: "INVALID"}
				c.Description = "test"
				return c
			},
			errCheck: func(err error) bool {
				return strings.Contains(err.Error(), shared.ErrInvalidCommitType.Error())
			},
		},
		{
			name: "ErrEmptyDescription",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = ""
				return c
			},
			errCheck: func(err error) bool {
				return strings.Contains(err.Error(), shared.ErrEmptyDescription.Error())
			},
		},
		{
			name: "ErrDescriptionTooLong",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = strings.Repeat("a", 73)
				return c
			},
			errCheck: func(err error) bool {
				return strings.Contains(err.Error(), shared.ErrDescriptionTooLong.Error())
			},
		},
		{
			name: "ErrInvalidScopeFormat",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = "test"
				c.Scope = "invalid scope"
				return c
			},
			errCheck: func(err error) bool {
				return strings.Contains(err.Error(), shared.ErrInvalidScopeFormat.Error())
			},
		},
		{
			name: "ErrBodyTooLong",
			commit: func() *Commit {
				c := NewCommit(&cfg.Commit)
				c.Type = TypeFeat
				c.Description = "test"
				c.Body = strings.Repeat("a", 501)
				return c
			},
			errCheck: func(err error) bool {
				return strings.Contains(err.Error(), shared.ErrBodyTooLong.Error())
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.commit().Validate()

			if err == nil {
				t.Error("Expected error but got none")
				return
			}

			if !tt.errCheck(err) {
				t.Errorf("Error does not match expected type: %v", err)
			}
		})
	}
}
