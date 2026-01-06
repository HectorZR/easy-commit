package components

import (
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/lipgloss"
)

var (
	focusedStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))
	blurredStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("240"))
	cursorStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))
)

// NewDescriptionInput creates a text input for commit description
func NewDescriptionInput() textinput.Model {
	ti := textinput.New()
	ti.Placeholder = "add user authentication system"
	ti.Focus()
	ti.CharLimit = 72 // Conventional commit subject line limit
	ti.Width = 60
	ti.Prompt = "→ "
	ti.PromptStyle = focusedStyle
	ti.TextStyle = lipgloss.NewStyle()
	ti.Cursor.Style = cursorStyle

	return ti
}

// NewScopeInput creates a text input for commit scope
func NewScopeInput() textinput.Model {
	ti := textinput.New()
	ti.Placeholder = "api, ui, auth... (optional)"
	ti.Focus()
	ti.CharLimit = 30
	ti.Width = 40
	ti.Prompt = "→ "
	ti.PromptStyle = focusedStyle
	ti.TextStyle = lipgloss.NewStyle()
	ti.Cursor.Style = cursorStyle

	return ti
}

// NewBodyInput creates a text input for commit body
func NewBodyInput() textinput.Model {
	ti := textinput.New()
	ti.Placeholder = "Detailed explanation... (optional)"
	ti.Focus()
	ti.CharLimit = 0 // No limit for body
	ti.Width = 60
	ti.Prompt = "→ "
	ti.PromptStyle = focusedStyle
	ti.TextStyle = lipgloss.NewStyle()
	ti.Cursor.Style = cursorStyle

	return ti
}

// ValidationResult represents the validation state of an input
type ValidationResult struct {
	Valid   bool
	Message string
}

// ValidateDescription validates commit description
func ValidateDescription(value string) ValidationResult {
	if value == "" {
		return ValidationResult{
			Valid:   false,
			Message: "Description is required",
		}
	}

	if len(value) > 72 {
		return ValidationResult{
			Valid:   false,
			Message: "Description is too long (max 72 characters)",
		}
	}

	return ValidationResult{Valid: true}
}

// GetCharCountDisplay returns a colored character count display
func GetCharCountDisplay(current, max int) string {
	if max == 0 {
		return ""
	}

	countStr := lipgloss.JoinHorizontal(
		lipgloss.Left,
		lipgloss.NewStyle().Foreground(lipgloss.Color("240")).Render("Characters: "),
	)

	var style lipgloss.Style
	if current > max {
		style = lipgloss.NewStyle().Foreground(lipgloss.Color("196")).Bold(true) // Red
	} else if current > int(float64(max)*0.8) {
		style = lipgloss.NewStyle().Foreground(lipgloss.Color("214")) // Orange
	} else {
		style = lipgloss.NewStyle().Foreground(lipgloss.Color("42")) // Green
	}

	countStr += style.Render(lipgloss.JoinHorizontal(
		lipgloss.Left,
		string(rune('0'+current/10)),
		string(rune('0'+current%10)),
		"/",
		string(rune('0'+max/10)),
		string(rune('0'+max%10)),
	))

	if current <= max {
		countStr += lipgloss.NewStyle().Foreground(lipgloss.Color("42")).Render(" ✓")
	} else {
		countStr += lipgloss.NewStyle().Foreground(lipgloss.Color("196")).Render(" ✗")
	}

	return countStr
}
