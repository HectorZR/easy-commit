package application

import (
	"context"
	"time"

	"github.com/hector/easy-commit/internal/domain"
	"github.com/hector/easy-commit/internal/shared"
)

type CommitService struct {
	gitRepo   domain.GitRepository
	validator domain.CommitValidator
	logger    *shared.Logger
}

func NewCommitService(repo domain.GitRepository, validator domain.CommitValidator, logger *shared.Logger) *CommitService {
	return &CommitService{
		gitRepo:   repo,
		validator: validator,
		logger:    logger,
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
	validateCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
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
