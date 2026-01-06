package main

import (
	"context"
	"fmt"
	"os"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/hector/easy-commit/internal/application"
	"github.com/hector/easy-commit/internal/domain"
	"github.com/hector/easy-commit/internal/infrastructure/cli"
	"github.com/hector/easy-commit/internal/infrastructure/git"
	"github.com/hector/easy-commit/internal/infrastructure/tui"
	"github.com/hector/easy-commit/internal/shared"
)

const version = "1.0.0"

func main() {
	// Parse CLI arguments
	parser := cli.NewParser("easy-commit", version)
	config, err := parser.Parse(os.Args[1:])
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing arguments: %v\n", err)
		parser.ShowHelp()
		os.Exit(1)
	}

	// Handle help
	if config.Help {
		parser.ShowHelp()
		return
	}

	// Handle version
	if config.Version {
		fmt.Printf("easy-commit version %s\n", version)
		return
	}

	// Initialize logger
	logger := shared.NewLogger(shared.INFO)
	logger.Info("Starting easy-commit v%s", version)

	// Initialize dependencies
	gitRepo := git.NewExecutor(logger)
	validator := application.NewConcurrentValidator(4)
	service := application.NewCommitService(gitRepo, validator, logger)

	// Check if we're in a git repository
	if !gitRepo.IsGitRepository() {
		fmt.Fprintf(os.Stderr, "Error: Not a git repository\n")
		fmt.Fprintf(os.Stderr, "Please run this command from within a git repository.\n")
		os.Exit(1)
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	// Run appropriate mode
	if config.IsInteractive() {
		// Interactive mode with Bubble Tea TUI
		logger.Info("Running in interactive mode with TUI")

		// Get commit types
		commitTypes := domain.CommitTypes{}.GetDefault()

		// Create Bubble Tea model
		model := tui.NewModel(service, commitTypes, ctx)

		// Run Bubble Tea program
		program := tea.NewProgram(model)
		finalModel, err := program.Run()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}

		// Check result
		result := finalModel.(tui.Model)
		if result.IsCancelled() {
			fmt.Fprintf(os.Stderr, "Commit cancelled by user\n")
			os.Exit(1)
		}

		if result.GetError() != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", result.GetError())
			os.Exit(1)
		}

		// Success is already shown by the TUI
	} else {
		// Direct mode (non-interactive)
		logger.Info("Running in direct mode")

		commit, err := config.ToCommit()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error creating commit: %v\n", err)
			os.Exit(1)
		}

		// Dry run - just show preview
		if config.DryRun {
			fmt.Println("Preview (dry-run):")
			fmt.Println(service.PreviewCommit(commit))
			return
		}

		// Execute commit
		if err := service.CreateCommit(ctx, commit); err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}

		fmt.Println("✓ Commit created successfully!")
	}
}
