package domain

import (
	"strings"

	"github.com/hector/easy-commit/internal/config"
	"github.com/hector/easy-commit/internal/shared"
)

// CLIConfig holds the configuration options for the CLI application.
type CLIConfig struct {
	// Commit data
	TypeName    string
	Description string
	Scope       string
	Body        string
	Breaking    bool

	// CLI options
	Interactive bool
	DryRun      bool
	Help        bool
	Version     bool
}

// IsInteractive determines if the CLI should run in interactive mode.
func (c *CLIConfig) IsInteractive() bool {
	// Explicit interactive flag takes precedence
	if c.Interactive {
		return true
	}

	// If type or description are empty, default to interactive
	// unless both are empty (which also triggers interactive)
	if c.TypeName == "" && c.Description == "" {
		return true
	}

	// If both type and description are provided, it's direct mode
	if c.TypeName != "" && c.Description != "" {
		return false
	}

	// If only one is provided (partial data), it's also direct mode
	// The validation will catch the missing field later
	return false
}

// Validate checks if the CLIConfig has valid values.
func (c *CLIConfig) Validate() error {
	if c.Help || c.Version {
		return nil
	}

	if !c.IsInteractive() {
		if c.TypeName == "" {
			return shared.WrapError(shared.ErrInvalidCommitType, "commit type is required")
		}
		if strings.TrimSpace(c.Description) == "" {
			return shared.WrapError(shared.ErrEmptyDescription, "commit description is required")
		}
	}

	return nil
}

func (c *CLIConfig) ToCommit() (*Commit, error) {
	// Use default config for backward compatibility
	return c.ToCommitWithConfig(&config.DefaultConfig().Commit)
}

func (c *CLIConfig) ToCommitWithConfig(cfg *config.CommitConfig) (*Commit, error) {
	if c.TypeName == "" {
		return nil, shared.WrapError(shared.ErrInvalidCommitType, "commit type is required")
	}

	defaultTypes := CommitTypes{}.GetDefault()
	commitType, err := defaultTypes.GetByName(c.TypeName)
	if err != nil {
		return nil, err
	}

	commit := NewCommit(cfg)
	commit.Type = commitType
	commit.Scope = c.Scope
	commit.Description = c.Description
	commit.Body = c.Body
	commit.Breaking = c.Breaking

	return commit, commit.Validate()
}
