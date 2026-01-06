package tui

import "github.com/hector/easy-commit/internal/domain"

// Custom messages for Bubble Tea event loop

// TypeSelectedMsg is sent when a commit type is selected
type TypeSelectedMsg struct {
	Type domain.CommitType
}

// InputCompletedMsg is sent when an input field is completed
type InputCompletedMsg struct {
	Field string
	Value string
}

// ConfirmationMsg is sent when user confirms or cancels
type ConfirmationMsg struct {
	Confirmed bool
}

// CommitCreatedMsg is sent when git commit completes successfully
type CommitCreatedMsg struct {
	Success bool
	Error   error
}

// ErrorMsg is sent when an error occurs
type ErrorMsg struct {
	Err error
}

// GoBackMsg is sent when user wants to go back to previous step
type GoBackMsg struct{}

// QuitMsg is sent when user wants to quit the application
type QuitMsg struct{}
