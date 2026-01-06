package components

import (
	"strings"

	"github.com/charmbracelet/lipgloss"
	"github.com/hector/easy-commit/internal/domain"
)

var (
	previewBoxBorderStyle = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(lipgloss.Color("62")).
				Padding(1, 2).
				MarginTop(1).
				MarginBottom(1)

	previewTitleStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(lipgloss.Color("170")).
				MarginBottom(1)

	previewContentStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("255"))
)

// RenderPreview renders a commit preview with a nice box
func RenderPreview(commit *domain.Commit) string {
	if commit == nil {
		return ""
	}

	message := commit.Format()
	lines := strings.Split(message, "\n")

	// Calculate box width
	width := 60
	for _, line := range lines {
		if len(line)+4 > width {
			width = len(line) + 4
		}
	}

	// Apply width to box style
	boxStyle := previewBoxBorderStyle.Width(width)

	// Render content
	content := previewContentStyle.Render(message)

	return lipgloss.JoinVertical(
		lipgloss.Left,
		previewTitleStyle.Render("📝 Commit Preview"),
		boxStyle.Render(content),
	)
}

// RenderCommitSummary renders a summary of the commit being built
func RenderCommitSummary(commit *domain.Commit) string {
	if commit == nil {
		return ""
	}

	var parts []string

	// Type
	typeStr := lipgloss.NewStyle().
		Foreground(lipgloss.Color("62")).
		Bold(true).
		Render("Type: ") +
		lipgloss.NewStyle().
			Foreground(lipgloss.Color("170")).
			Render(commit.Type.Name)
	parts = append(parts, typeStr)

	// Description
	if commit.Description != "" {
		descStr := lipgloss.NewStyle().
			Foreground(lipgloss.Color("62")).
			Bold(true).
			Render("Description: ") +
			commit.Description
		parts = append(parts, descStr)
	}

	// Scope
	if commit.Scope != "" {
		scopeStr := lipgloss.NewStyle().
			Foreground(lipgloss.Color("62")).
			Bold(true).
			Render("Scope: ") +
			commit.Scope
		parts = append(parts, scopeStr)
	}

	// Body
	if commit.Body != "" {
		bodyStr := lipgloss.NewStyle().
			Foreground(lipgloss.Color("62")).
			Bold(true).
			Render("Body: ") +
			commit.Body
		parts = append(parts, bodyStr)
	}

	// Breaking
	if commit.Breaking {
		breakingStr := lipgloss.NewStyle().
			Foreground(lipgloss.Color("196")).
			Bold(true).
			Render("⚠ BREAKING CHANGE")
		parts = append(parts, breakingStr)
	}

	return lipgloss.JoinVertical(lipgloss.Left, parts...)
}
