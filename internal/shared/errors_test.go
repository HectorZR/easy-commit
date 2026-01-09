package shared

import (
	"errors"
	"strings"
	"testing"
)

func TestErrors_Defined(t *testing.T) {
	// Test that all error variables are defined and not nil
	errorVars := []struct {
		name string
		err  error
	}{
		{"ErrBodyTooLong", ErrBodyTooLong},
		{"ErrDescriptionTooLong", ErrDescriptionTooLong},
		{"ErrEmptyDescription", ErrEmptyDescription},
		{"ErrInvalidCommitType", ErrInvalidCommitType},
		{"ErrInvalidScopeFormat", ErrInvalidScopeFormat},
		{"ErrGitCommandFailed", ErrGitCommandFailed},
	}

	for _, ev := range errorVars {
		t.Run(ev.name, func(t *testing.T) {
			if ev.err == nil {
				t.Errorf("Expected %s to be defined, got nil", ev.name)
			}
		})
	}
}

func TestErrors_Messages(t *testing.T) {
	tests := []struct {
		err             error
		expectedMessage string
	}{
		{ErrBodyTooLong, "body exceeds maximum length"},
		{ErrDescriptionTooLong, "description exceeds maximum length"},
		{ErrEmptyDescription, "description cannot be empty"},
		{ErrInvalidCommitType, "invalid commit type"},
		{ErrInvalidScopeFormat, "scope contains invalid characters"},
		{ErrGitCommandFailed, "git command execution failed"},
	}

	for _, tt := range tests {
		t.Run(tt.expectedMessage, func(t *testing.T) {
			if tt.err.Error() != tt.expectedMessage {
				t.Errorf("Expected error message %q, got %q", tt.expectedMessage, tt.err.Error())
			}
		})
	}
}

func TestWrapError_WithNilError(t *testing.T) {
	result := WrapError(nil, "some context")

	if result != nil {
		t.Errorf("Expected nil when wrapping nil error, got: %v", result)
	}
}

func TestWrapError_WithError(t *testing.T) {
	originalErr := errors.New("original error")
	context := "additional context"

	wrapped := WrapError(originalErr, context)

	if wrapped == nil {
		t.Fatal("Expected wrapped error, got nil")
	}

	// Check that the error message contains both context and original error
	errorMsg := wrapped.Error()
	if !strings.Contains(errorMsg, context) {
		t.Errorf("Expected error to contain context %q, got: %s", context, errorMsg)
	}

	if !strings.Contains(errorMsg, "original error") {
		t.Errorf("Expected error to contain original message, got: %s", errorMsg)
	}

	// Test that errors.Is works with wrapped errors
	if !errors.Is(wrapped, originalErr) {
		t.Error("Expected errors.Is to identify wrapped error")
	}
}

func TestWrapError_WithPredefinedError(t *testing.T) {
	tests := []struct {
		name    string
		err     error
		context string
	}{
		{
			name:    "wrap ErrInvalidCommitType",
			err:     ErrInvalidCommitType,
			context: "validation failed",
		},
		{
			name:    "wrap ErrEmptyDescription",
			err:     ErrEmptyDescription,
			context: "commit description is required",
		},
		{
			name:    "wrap ErrGitCommandFailed",
			err:     ErrGitCommandFailed,
			context: "failed to execute git commit",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			wrapped := WrapError(tt.err, tt.context)

			if wrapped == nil {
				t.Fatal("Expected wrapped error, got nil")
			}

			// Test that errors.Is can unwrap to find the original error
			if !errors.Is(wrapped, tt.err) {
				t.Errorf("Expected errors.Is to identify %v in wrapped error", tt.err)
			}

			// Test that the context is in the error message
			if !strings.Contains(wrapped.Error(), tt.context) {
				t.Errorf("Expected error to contain context %q, got: %s", tt.context, wrapped.Error())
			}
		})
	}
}

func TestWrapError_MultipleWrapping(t *testing.T) {
	originalErr := errors.New("original")
	wrapped1 := WrapError(originalErr, "first wrap")
	wrapped2 := WrapError(wrapped1, "second wrap")

	if wrapped2 == nil {
		t.Fatal("Expected wrapped error, got nil")
	}

	// Should be able to unwrap to original error
	if !errors.Is(wrapped2, originalErr) {
		t.Error("Expected errors.Is to find original error through multiple wraps")
	}

	errorMsg := wrapped2.Error()

	// Both contexts should be in the message
	if !strings.Contains(errorMsg, "first wrap") {
		t.Error("Expected error to contain first wrap context")
	}

	if !strings.Contains(errorMsg, "second wrap") {
		t.Error("Expected error to contain second wrap context")
	}
}

func TestWrapError_Format(t *testing.T) {
	originalErr := ErrInvalidCommitType
	context := "type validation"

	wrapped := WrapError(originalErr, context)

	// Verify the format is "context: original"
	expected := context + ": " + originalErr.Error()
	if wrapped.Error() != expected {
		t.Errorf("Expected format %q, got %q", expected, wrapped.Error())
	}
}

func TestErrors_AreUnique(t *testing.T) {
	// Verify all errors are distinct
	errors := []error{
		ErrBodyTooLong,
		ErrDescriptionTooLong,
		ErrEmptyDescription,
		ErrInvalidCommitType,
		ErrInvalidScopeFormat,
		ErrGitCommandFailed,
	}

	for i, err1 := range errors {
		for j, err2 := range errors {
			if i != j && err1 == err2 {
				t.Errorf("Errors at index %d and %d are not unique", i, j)
			}
		}
	}
}

func TestWrapError_PreservesErrorChain(t *testing.T) {
	baseErr := ErrGitCommandFailed
	wrapped := WrapError(baseErr, "context")

	// Test using errors.Is
	if !errors.Is(wrapped, ErrGitCommandFailed) {
		t.Error("errors.Is should return true for wrapped error")
	}

	// Test that it doesn't match other errors
	if errors.Is(wrapped, ErrInvalidCommitType) {
		t.Error("errors.Is should return false for different error")
	}
}
