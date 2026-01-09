package tui

import (
	"fmt"

	"github.com/charmbracelet/lipgloss"
	"github.com/hector/easy-commit/internal/infrastructure/tui/components"
)

// RenderView renders the entire view based on current model state
func RenderView(m Model) string {
	if m.quitting {
		if m.cancelled {
			return RenderWarning("Commit cancelled by user\n")
		}
		// TUI is exiting to execute commit
		return renderExitingForCommit(m)
	}

	// Render header
	header := renderHeader(m)

	// Render current step
	var content string
	switch m.currentStep {
	case StepTypeSelect:
		content = renderTypeSelection(m)
	case StepDescription:
		content = renderDescriptionInput(m)
	case StepScope:
		content = renderScopeInput(m)
	case StepBody:
		content = renderBodyInput(m)
	case StepBreaking:
		content = renderBreakingConfirmation(m)
	case StepPreview:
		content = renderPreview(m)
	case StepConfirm:
		content = renderFinalConfirmation(m)
	default:
		content = "Unknown step"
	}

	// Render footer with help
	footer := renderFooter(m)

	// Combine all parts
	return lipgloss.JoinVertical(
		lipgloss.Left,
		header,
		"",
		content,
		"",
		footer,
	)
}

// renderHeader renders the header with step progress
func renderHeader(m Model) string {
	totalSteps := 5
	currentStepNum := getStepNumber(m.currentStep)

	title := TitleStyle.Render("📝 Easy Commit - Interactive Conventional Commits")

	step := ""
	if currentStepNum > 0 && currentStepNum <= totalSteps {
		step = SubtleStyle.Render(fmt.Sprintf("Step %d/%d", currentStepNum, totalSteps))
	}

	separator := lipgloss.NewStyle().
		Foreground(MutedColor).
		Render(lipgloss.JoinHorizontal(lipgloss.Left, "─", "─", "─", "─", "─", "─", "─", "─", "─", "─"))

	return lipgloss.JoinVertical(
		lipgloss.Left,
		title,
		step,
		separator,
	)
}

// renderFooter renders help text at the bottom
func renderFooter(m Model) string {
	var help string

	switch m.currentStep {
	case StepTypeSelect:
		help = "[↑↓] Navigate  [/] Filter  [Enter] Select  [Ctrl+C] Cancel"
	case StepDescription, StepScope:
		backHelp := ""
		if m.currentStep > StepTypeSelect {
			backHelp = "  [Ctrl+B] Back"
		}
		help = "[Enter] Continue" + backHelp + "  [Ctrl+C] Cancel"
	case StepBody:
		help = "[Enter] New line  [Ctrl+D] Continue  [Ctrl+B] Back  [Ctrl+C] Cancel"
	case StepBreaking, StepConfirm:
		help = "[Y/N] or [←→] Choose  [Enter] Continue  [Ctrl+B] Back  [Ctrl+C] Cancel"
	case StepPreview:
		help = "[Enter] Continue  [Ctrl+B] Back  [Ctrl+C] Cancel"
	default:
		help = "[Ctrl+C] Cancel"
	}

	return SubtleStyle.Render(help)
}

// renderTypeSelection renders the commit type selection step
func renderTypeSelection(m Model) string {
	instruction := HeaderStyle.Render("Select a commit type:")
	list := m.typeList.View()

	return lipgloss.JoinVertical(
		lipgloss.Left,
		instruction,
		"",
		list,
	)
}

// renderDescriptionInput renders the description input step
func renderDescriptionInput(m Model) string {
	instruction := HeaderStyle.Render("Enter a concise description:")
	info := SubtleStyle.Render("Use present tense and lowercase (e.g., 'add feature' not 'Added feature')")

	input := m.descInput.View()

	// Character count
	charCount := components.GetCharCountDisplay(len(m.descInput.Value()), 72)

	// Error message if any
	errorMsg := ""
	if m.err != nil {
		errorMsg = "\n" + RenderError(m.err.Error())
	}

	return lipgloss.JoinVertical(
		lipgloss.Left,
		instruction,
		info,
		"",
		input,
		charCount,
		errorMsg,
	)
}

// renderScopeInput renders the scope input step
func renderScopeInput(m Model) string {
	instruction := HeaderStyle.Render("Enter scope (optional):")
	info := SubtleStyle.Render("Scope indicates which part of the codebase is affected (e.g., api, ui, auth)")
	skipInfo := MutedStyle.Render("Press Enter to skip")

	input := m.scopeInput.View()

	return lipgloss.JoinVertical(
		lipgloss.Left,
		instruction,
		info,
		skipInfo,
		"",
		input,
	)
}

// renderBodyInput renders the body input step
func renderBodyInput(m Model) string {
	instruction := HeaderStyle.Render("Enter detailed description (optional):")
	info := SubtleStyle.Render("Provide additional context about the changes. Use ↑↓ to navigate, Enter for new line.")
	skipInfo := MutedStyle.Render("Press Ctrl+D or Esc then Enter to finish")

	input := m.bodyInput.View()

	return lipgloss.JoinVertical(
		lipgloss.Left,
		instruction,
		info,
		skipInfo,
		"",
		input,
	)
}

// renderBreakingConfirmation renders the breaking change confirmation
func renderBreakingConfirmation(m Model) string {
	instruction := HeaderStyle.Render("Breaking Change")
	info := SubtleStyle.Render("Breaking changes require a major version bump according to semantic versioning")

	confirmation := components.RenderBreakingChangeConfirmation(m.breakingConfirm.YesSelected)

	return lipgloss.JoinVertical(
		lipgloss.Left,
		instruction,
		info,
		"",
		confirmation,
	)
}

// renderPreview renders the commit preview
func renderPreview(m Model) string {
	instruction := HeaderStyle.Render("Preview your commit:")

	preview := components.RenderPreview(m.commit)

	info := SubtleStyle.Render("Review the commit message above. Press Enter to continue or Ctrl+B to go back and edit.")

	return lipgloss.JoinVertical(
		lipgloss.Left,
		instruction,
		"",
		preview,
		"",
		info,
	)
}

// renderFinalConfirmation renders the final confirmation before creating commit
func renderFinalConfirmation(m Model) string {
	instruction := HeaderStyle.Render("Confirm Commit Creation")

	preview := components.RenderPreview(m.commit)

	confirmation := m.finalConfirm.Render()

	return lipgloss.JoinVertical(
		lipgloss.Left,
		instruction,
		"",
		preview,
		"",
		confirmation,
	)
}

// renderExitingForCommit shows a message before exiting TUI to execute commit
func renderExitingForCommit(m Model) string {
	message := HighlightStyle.Render("✓ Commit prepared!")
	info := SubtleStyle.Render("Executing git commit...")

	return lipgloss.JoinVertical(
		lipgloss.Left,
		"",
		message,
		info,
		"",
	)
}

// getStepNumber returns the step number for display (1-5)
func getStepNumber(step Step) int {
	switch step {
	case StepTypeSelect:
		return 1
	case StepDescription:
		return 2
	case StepScope:
		return 3
	case StepBody:
		return 4
	case StepBreaking, StepPreview, StepConfirm:
		return 5
	default:
		return 0
	}
}
