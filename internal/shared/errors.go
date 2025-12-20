package shared

import (
	"errors"
	"fmt"
)

var (
	ErrBodyTooLong        = errors.New("body exceeds maximum length")
	ErrDescriptionTooLong = errors.New("description exceeds maximum length")
	ErrEmptyDescription   = errors.New("description cannot be empty")
	ErrInvalidCommitType  = errors.New("invalid commit type")
	ErrInvalidScopeFormat = errors.New("scope contains invalid characters")
	ErrGitCommandFailed   = errors.New("git command execution failed")
)

// WrapError adds context to an existing error.
// If the provided error is nil, it returns nil.
//
// Example:
// err := someFunction()
//
//	if err != nil {
//	   return WrapError(err, "failed to execute someFunction")
//	}
func WrapError(err error, context string) error {
	if err == nil {
		return nil
	}

	return fmt.Errorf("%s: %w", context, err)
}
