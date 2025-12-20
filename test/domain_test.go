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
