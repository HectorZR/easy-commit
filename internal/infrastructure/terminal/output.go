package terminal

import (
	"fmt"
	"strings"
)

// ANSI color codes
const (
	ColorReset  = "\033[0m"
	ColorRed    = "\033[31m"
	ColorGreen  = "\033[32m"
	ColorYellow = "\033[33m"
	ColorBlue   = "\033[34m"
	ColorCyan   = "\033[36m"
	ColorBold   = "\033[1m"
)

// Output handles formatted terminal output
type Output struct {
	useColor bool
}

// NewOutput creates a new Output formatter
func NewOutput(useColor bool) *Output {
	return &Output{
		useColor: useColor,
	}
}

// PrintHeader displays a header with separator line
func (o *Output) PrintHeader(text string) {
	fmt.Println()
	if o.useColor {
		fmt.Printf("%s%s%s\n", ColorBold+ColorCyan, text, ColorReset)
	} else {
		fmt.Println(text)
	}
	fmt.Println(strings.Repeat("=", len(text)))
	fmt.Println()
}

// PrintSection displays a section title
func (o *Output) PrintSection(text string) {
	fmt.Printf("\n%s\n", text)
}

// PrintOption displays a numbered menu option
func (o *Output) PrintOption(num int, name, description string) {
	if o.useColor {
		fmt.Printf("  %s%d)%s %-12s - %s\n",
			ColorYellow, num, ColorReset, name, description)
	} else {
		fmt.Printf("  %d) %-12s - %s\n", num, name, description)
	}
}

// PrintPreview displays a commit message preview in a box
func (o *Output) PrintPreview(message string) {
	fmt.Println()
	if o.useColor {
		fmt.Printf("%sPreview:%s\n", ColorBold, ColorReset)
	} else {
		fmt.Println("Preview:")
	}

	lines := strings.Split(message, "\n")

	// Calculate box width (minimum 50, or longest line + padding)
	width := 50
	for _, line := range lines {
		lineLen := len(line)
		if lineLen+4 > width {
			width = lineLen + 4
		}
	}

	// Top border
	fmt.Println("┌" + strings.Repeat("─", width) + "┐")

	// Content lines
	for _, line := range lines {
		padding := width - len(line) - 2
		if padding < 0 {
			padding = 0
		}
		fmt.Printf("│ %s%s │\n", line, strings.Repeat(" ", padding))
	}

	// Bottom border
	fmt.Println("└" + strings.Repeat("─", width) + "┘")
	fmt.Println()
}

// PrintSuccess displays a success message in green
func (o *Output) PrintSuccess(text string) {
	if o.useColor {
		fmt.Printf("%s✓ %s%s\n", ColorGreen, text, ColorReset)
	} else {
		fmt.Printf("✓ %s\n", text)
	}
}

// PrintError displays an error message in red
func (o *Output) PrintError(text string) {
	if o.useColor {
		fmt.Printf("%s✗ %s%s\n", ColorRed, text, ColorReset)
	} else {
		fmt.Printf("✗ %s\n", text)
	}
}

// PrintWarning displays a warning message in yellow
func (o *Output) PrintWarning(text string) {
	if o.useColor {
		fmt.Printf("%s⚠ %s%s\n", ColorYellow, text, ColorReset)
	} else {
		fmt.Printf("⚠ %s\n", text)
	}
}

// PrintInfo displays an info message in blue
func (o *Output) PrintInfo(text string) {
	if o.useColor {
		fmt.Printf("%sℹ %s%s\n", ColorBlue, text, ColorReset)
	} else {
		fmt.Printf("ℹ %s\n", text)
	}
}
