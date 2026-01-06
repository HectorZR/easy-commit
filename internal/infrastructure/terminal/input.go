package terminal

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/hector/easy-commit/internal/config"
)

// Input handles user input from terminal
type Input struct {
	scanner *bufio.Scanner
	config  *config.TimeoutsConfig
}

// NewInput creates a new Input reader
func NewInput(cfg *config.TimeoutsConfig) *Input {
	return &Input{
		scanner: bufio.NewScanner(os.Stdin),
		config:  cfg,
	}
}

// ReadLine reads a single line with prompt
func (i *Input) ReadLine(prompt string) (string, error) {
	fmt.Print(prompt)

	// Create channels for input and errors
	inputChan := make(chan string, 1)
	errChan := make(chan error, 1)

	// Read in goroutine
	go func() {
		if i.scanner.Scan() {
			inputChan <- i.scanner.Text()
		} else if err := i.scanner.Err(); err != nil {
			errChan <- err
		} else {
			inputChan <- "" // EOF
		}
	}()

	// Wait with timeout
	ctx, cancel := context.WithTimeout(context.Background(), i.config.UserInput)
	defer cancel()

	select {
	case input := <-inputChan:
		return strings.TrimSpace(input), nil
	case err := <-errChan:
		return "", fmt.Errorf("input error: %w", err)
	case <-ctx.Done():
		return "", fmt.Errorf("input timeout after %v", i.config.UserInput)
	}
}

// ReadInt reads an integer with prompt and validation
func (i *Input) ReadInt(prompt string, args ...any) (int, error) {
	formattedPrompt := fmt.Sprintf(prompt, args...)
	input, err := i.ReadLine(formattedPrompt)
	if err != nil {
		return 0, err
	}

	num, err := strconv.Atoi(input)
	if err != nil {
		return 0, fmt.Errorf("invalid number: %s", input)
	}

	return num, nil
}

// ReadConfirmation reads yes/no confirmation (Y/n format)
// Returns true for yes (Y, y, yes, or empty), false for no
func (i *Input) ReadConfirmation(prompt string) bool {
	input, err := i.ReadLine(prompt)
	if err != nil {
		return false
	}

	input = strings.ToLower(strings.TrimSpace(input))

	// Empty or "y" or "yes" = true
	// Anything else = false
	return input == "" || input == "y" || input == "yes"
}
