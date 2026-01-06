package tui

import "github.com/charmbracelet/lipgloss"

// Color palette - configurable for future theming
var (
	PrimaryColor   = lipgloss.Color("62")  // Cyan
	SecondaryColor = lipgloss.Color("170") // Purple
	ErrorColor     = lipgloss.Color("196") // Red
	SuccessColor   = lipgloss.Color("42")  // Green
	WarningColor   = lipgloss.Color("214") // Orange
	MutedColor     = lipgloss.Color("240") // Gray
	AccentColor    = lipgloss.Color("205") // Pink
)

// Text styles
var (
	TitleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(PrimaryColor).
			Padding(0, 1)

	HeaderStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(SecondaryColor).
			MarginBottom(1)

	PromptStyle = lipgloss.NewStyle().
			Foreground(SecondaryColor).
			Bold(true)

	ErrorStyle = lipgloss.NewStyle().
			Foreground(ErrorColor).
			Bold(true)

	SuccessStyle = lipgloss.NewStyle().
			Foreground(SuccessColor).
			Bold(true)

	WarningStyle = lipgloss.NewStyle().
			Foreground(WarningColor).
			Bold(true)

	MutedStyle = lipgloss.NewStyle().
			Foreground(MutedColor)

	SubtleStyle = lipgloss.NewStyle().
			Foreground(MutedColor).
			Italic(true)

	HighlightStyle = lipgloss.NewStyle().
			Foreground(AccentColor).
			Bold(true)
)

// Box styles
var (
	BoxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(PrimaryColor).
			Padding(1, 2).
			MarginBottom(1)

	PreviewBoxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(SecondaryColor).
			Padding(1, 2).
			MarginTop(1).
			MarginBottom(1)

	HelpBoxStyle = lipgloss.NewStyle().
			Border(lipgloss.NormalBorder()).
			BorderForeground(MutedColor).
			Padding(0, 1).
			Foreground(MutedColor)
)

// Layout styles
var (
	ContainerStyle = lipgloss.NewStyle().
			Padding(1, 2)

	SectionStyle = lipgloss.NewStyle().
			MarginBottom(1)

	StepStyle = lipgloss.NewStyle().
			Foreground(PrimaryColor).
			Bold(true)
)

// Input styles
var (
	InputStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("255")).
			Bold(false)

	PlaceholderStyle = lipgloss.NewStyle().
				Foreground(MutedColor).
				Italic(true)

	FocusedPromptStyle = lipgloss.NewStyle().
				Foreground(AccentColor).
				Bold(true)

	BlurredPromptStyle = lipgloss.NewStyle().
				Foreground(MutedColor)
)

// Helper functions for common patterns
func RenderTitle(text string) string {
	return TitleStyle.Render(text)
}

func RenderHeader(text string) string {
	return HeaderStyle.Render(text)
}

func RenderError(text string) string {
	return ErrorStyle.Render("✗ " + text)
}

func RenderSuccess(text string) string {
	return SuccessStyle.Render("✓ " + text)
}

func RenderWarning(text string) string {
	return WarningStyle.Render("⚠ " + text)
}

func RenderInfo(text string) string {
	return MutedStyle.Render("ℹ " + text)
}

func RenderStep(current, total int) string {
	return StepStyle.Render(lipgloss.JoinHorizontal(
		lipgloss.Left,
		"Step ",
		lipgloss.NewStyle().Foreground(AccentColor).Render(string(rune('0'+current))),
		"/",
		string(rune('0'+total)),
	))
}

// Box rendering helpers
func RenderBox(content string) string {
	return BoxStyle.Render(content)
}

func RenderPreviewBox(content string) string {
	return PreviewBoxStyle.Render(content)
}

func RenderHelpBox(content string) string {
	return HelpBoxStyle.Render(content)
}
