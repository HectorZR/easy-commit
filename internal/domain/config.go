package domain

import (
	"strings"

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
	return c.Interactive || (c.TypeName == "" && c.Description == "")
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
	if c.TypeName == "" {
		return nil, shared.WrapError(shared.ErrInvalidCommitType, "commit type is required")
	}

	defaultTypes := CommitTypes{}.GetDefault()
	commitType, err := defaultTypes.GetByName(c.TypeName)
	if err != nil {
		return nil, err
	}

	commit := &Commit{
		Type:        commitType,
		Scope:       c.Scope,
		Description: c.Description,
		Body:        c.Body,
		Breaking:    c.Breaking,
	}

	return commit, commit.Validate()
}
