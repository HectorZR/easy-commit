package git

import (
	"context"
	"os"
	"os/exec"
	"strings"

	"github.com/hector/easy-commit/internal/config"
	"github.com/hector/easy-commit/internal/shared"
)

type Executor struct {
	config *config.TimeoutsConfig
	logger *shared.Logger
}

// NewExecutor creates a new Git Executor with the provided logger.
func NewExecutor(logger *shared.Logger, cfg *config.TimeoutsConfig) *Executor {
	return &Executor{
		config: cfg,
		logger: logger,
	}
}

// IsGitRepository checks if the current directory is part of a Git repository.
func (e *Executor) IsGitRepository() bool {
	ctx, cancel := context.WithTimeout(context.Background(), e.config.GitCommand)
	defer cancel()

	cmd := exec.CommandContext(ctx, "git", "rev-parse", "--git-dir")
	err := cmd.Run()

	if err != nil {
		e.logger.Debug("Not a git repository: %v", err)
		return false
	}

	e.logger.Debug("Git repository detected")
	return true
}

// HasStagedChanges checks if there are any staged changes in the Git repository.
func (e *Executor) HasStagedChanges() bool {
	ctx, cancel := context.WithTimeout(context.Background(), e.config.GitCommand)
	defer cancel()

	cmd := exec.CommandContext(ctx, "git", "diff", "--cached", "--quiet")
	err := cmd.Run()

	// Exit code 1 means there ARE changes (this is expected behavior)
	// Exit code 0 means NO changes
	hasChanges := err != nil

	e.logger.Debug("Has staged changes: %v", hasChanges)
	return hasChanges
}

// Commit creates a Git commit with the provided message.
// Output is shown directly to the user in real-time via stdout/stderr.
func (e *Executor) Commit(ctx context.Context, message string) error {
	e.logger.Info("Executing Git commit")

	cmd := exec.CommandContext(ctx, "git", "commit", "-m", message)

	// Connect git's output directly to the terminal for real-time output
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Run()

	if err != nil {
		e.logger.Error("Git commit failed: %v", err)
		return shared.WrapError(shared.ErrGitCommandFailed, err.Error())
	}

	e.logger.Info("Git commit successful")
	return nil
}

// GetLastCommitMessage retrieves the last commit message
func (e *Executor) GetLastCommitMessage() (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), e.config.GitCommand)
	defer cancel()
	cmd := exec.CommandContext(ctx, "git", "log", "-1", "--pretty=%B")
	output, err := cmd.Output()
	if err != nil {
		e.logger.Error("Failed to get last commit: %v", err)
		return "", shared.WrapError(shared.ErrGitCommandFailed, err.Error())
	}
	message := strings.TrimSpace(string(output))
	e.logger.Debug("Last commit message: %s", message)
	return message, nil
}
