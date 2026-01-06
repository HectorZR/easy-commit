package components

import (
	"github.com/charmbracelet/lipgloss"
)

var (
	confirmYesStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("42")).
			Bold(true)

	confirmNoStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("196")).
			Bold(true)

	confirmMutedStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("240"))
)

// ConfirmationState represents the current selection state
type ConfirmationState struct {
	YesSelected bool // true = Yes, false = No
	Prompt      string
}

// NewConfirmation creates a new confirmation state with default to Yes
func NewConfirmation(prompt string) ConfirmationState {
	return ConfirmationState{
		YesSelected: true,
		Prompt:      prompt,
	}
}

// Toggle switches between Yes and No
func (c *ConfirmationState) Toggle() {
	c.YesSelected = !c.YesSelected
}

// GetValue returns true for Yes, false for No
func (c ConfirmationState) GetValue() bool {
	return c.YesSelected
}

// Render returns the rendered confirmation UI
func (c ConfirmationState) Render() string {
	var yesText, noText string

	if c.YesSelected {
		yesText = confirmYesStyle.Render("[Y] Yes")
		noText = confirmMutedStyle.Render(" [N] No")
	} else {
		yesText = confirmMutedStyle.Render(" [Y] Yes")
		noText = confirmNoStyle.Render("[N] No")
	}

	prompt := lipgloss.NewStyle().
		Foreground(lipgloss.Color("170")).
		Bold(true).
		Render(c.Prompt + " ")

	return prompt + yesText + noText
}

// RenderBreakingChangeConfirmation renders the breaking change confirmation
func RenderBreakingChangeConfirmation(selected bool) string {
	var yesText, noText string

	if selected {
		yesText = confirmYesStyle.Render("[Y] Yes")
		noText = confirmMutedStyle.Render(" [N] No")
	} else {
		yesText = confirmMutedStyle.Render(" [Y] Yes")
		noText = confirmNoStyle.Render("[N] No")
	}

	prompt := lipgloss.NewStyle().
		Foreground(lipgloss.Color("214")).
		Bold(true).
		Render("Is this a breaking change? ")

	warning := lipgloss.NewStyle().
		Foreground(lipgloss.Color("240")).
		Render("\n(Breaking changes require major version bump)")

	return prompt + yesText + noText + warning
}
