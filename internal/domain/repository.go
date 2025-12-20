package domain

import "context"

type GitRepository interface {
	IsGitRepository() bool
	HasStagedChanges() bool
	Commit(ctx context.Context, message string) error
	GetLastCommitMessage() (string, error)
}

type CommitValidator interface {
	Validate(ctx context.Context, commit Commit) error
}

type ConfigRepository interface {
	GetCommitTypes() CommitTypes
	GetDefaultType() CommitType
	IsInteractiveMode() bool
}
