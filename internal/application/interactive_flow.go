package application

import (
	"context"
	"fmt"

	"github.com/hector/easy-commit/internal/domain"
	"github.com/hector/easy-commit/internal/infrastructure/terminal"
	"github.com/hector/easy-commit/internal/shared"
)

// InteractiveFlow manages the interactive commit workflow
type InteractiveFlow struct {
	service     *CommitService
	input       *terminal.Input
	output      *terminal.Output
	commitTypes domain.CommitTypes
}

// NewInteractiveFlow creates a new interactive flow
func NewInteractiveFlow(
	service *CommitService,
	input *terminal.Input,
	output *terminal.Output,
) *InteractiveFlow {
	return &InteractiveFlow{
		service:     service,
		input:       input,
		output:      output,
		commitTypes: domain.CommitTypes{}.GetDefault(),
	}
}

// Run executes the interactive commit flow
func (f *InteractiveFlow) Run(ctx context.Context) error {
	f.output.PrintHeader("Easy Commit - Interactive Conventional Commits")

	// Step 1: Select commit type
	commitType, err := f.selectCommitType()
	if err != nil {
		return fmt.Errorf("failed to select commit type: %w", err)
	}

	// Step 2: Enter description
	description, err := f.input.ReadLine("\n[2/5] Enter commit description: ")
	if err != nil {
		return fmt.Errorf("failed to read description: %w", err)
	}

	if description == "" {
		return fmt.Errorf("description cannot be empty")
	}

	// Step 3: Optional scope
	f.output.PrintInfo("Scope is optional. Press Enter to skip.")
	scope, err := f.input.ReadLine("[3/5] Enter scope (optional): ")
	if err != nil {
		return fmt.Errorf("failed to read scope: %w", err)
	}

	// Step 4: Optional body
	f.output.PrintInfo("Body is optional. Press Enter to skip.")
	body, err := f.input.ReadLine("[4/5] Enter body (optional): ")
	if err != nil {
		return fmt.Errorf("failed to read body: %w", err)
	}

	// Step 5: Breaking change
	breaking := f.input.ReadConfirmation("[5/5] Is this a breaking change? (y/N): ")

	// Create commit object
	commit := &domain.Commit{
		Type:        commitType,
		Description: description,
		Scope:       scope,
		Body:        body,
		Breaking:    breaking,
	}

	// Validate before preview
	if err := commit.Validate(); err != nil {
		f.output.PrintError(fmt.Sprintf("Invalid commit: %v", err))
		return err
	}

	// Preview
	preview := f.service.PreviewCommit(commit)
	f.output.PrintPreview(preview)

	// Confirm
	if !f.input.ReadConfirmation("Create this commit? (Y/n): ") {
		f.output.PrintWarning("Commit cancelled by user")
		return shared.WrapError(shared.ErrGitCommandFailed, "user cancelled")
	}

	// Execute
	if err := f.service.CreateCommit(ctx, commit); err != nil {
		return fmt.Errorf("failed to create commit: %w", err)
	}

	f.output.PrintSuccess("Commit created successfully!")
	return nil
}

// selectCommitType displays commit type menu and returns selection
func (f *InteractiveFlow) selectCommitType() (domain.CommitType, error) {
	f.output.PrintSection("[1/5] Select commit type:")

	for i, ct := range f.commitTypes {
		f.output.PrintOption(i+1, ct.Name, ct.Description)
	}

	choice, err := f.input.ReadInt("\nEnter your choice (1-%d): ", len(f.commitTypes))
	if err != nil {
		return domain.CommitType{}, fmt.Errorf("invalid choice: %w", err)
	}

	if choice < 1 || choice > len(f.commitTypes) {
		return domain.CommitType{}, fmt.Errorf("choice out of range: %d (valid: 1-%d)", choice, len(f.commitTypes))
	}

	return f.commitTypes[choice-1], nil
}
