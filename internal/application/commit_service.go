package application

import (
	"context"

	"github.com/hector/easy-commit/internal/config"
	"github.com/hector/easy-commit/internal/domain"
	"github.com/hector/easy-commit/internal/shared"
)

type CommitService struct {
	gitRepo   domain.GitRepository
	validator domain.CommitValidator
	logger    *shared.Logger
	config    *config.Config
}

func NewCommitService(repo domain.GitRepository, validator domain.CommitValidator, logger *shared.Logger, cfg *config.Config) *CommitService {
	return &CommitService{
		gitRepo:   repo,
		validator: validator,
		logger:    logger,
		config:    cfg,
	}
}

// CreateCommit orchestrates the commit creation workflow
func (cs *CommitService) CreateCommit(ctx context.Context, commit *domain.Commit) error {
	cs.logger.Info("Starting commit creation: %s", commit.Description)

	// 1. Verify git repository
	if !cs.gitRepo.IsGitRepository() {
		cs.logger.Error("Not a git repository")
		return shared.WrapError(shared.ErrGitCommandFailed, "not a git repository")
	}

	// 2. Check for staged changes
	if !cs.gitRepo.HasStagedChanges() {
		cs.logger.Error("No staged changes to commit")
		return shared.WrapError(shared.ErrGitCommandFailed, "no staged changes")
	}

	// 3. Validate commit with timeout
	validateCtx, cancel := context.WithTimeout(ctx, cs.config.Timeouts.Validation)
	defer cancel()

	if err := cs.validator.Validate(validateCtx, *commit); err != nil {
		cs.logger.Error("Validation failed: %v", err)
		return err
	}

	// 4. Format message
	message := commit.Format()
	cs.logger.Debug("Formatted commit message: %s", message)

	// 5. Execute git commit
	if err := cs.gitRepo.Commit(ctx, message); err != nil {
		cs.logger.Error("Git commit failed: %v", err)
		return err
	}

	cs.logger.Info("Commit created successfully")
	return nil
}

// PreviewCommit returns the formatted commit message
func (cs *CommitService) PreviewCommit(commit *domain.Commit) string {
	return commit.Format()
}

// GetConfig returns the service configuration
func (cs *CommitService) GetConfig() *config.Config {
	return cs.config
}
