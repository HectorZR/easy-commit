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
)

func WrapError(err error, context string) error {
	if err == nil {
		return nil
	}

	return fmt.Errorf("%s: %w", context, err)
}
