package domain

import (
	"fmt"
	"strings"
	"unicode/utf8"

	"github.com/hector/easy-commit/internal/shared"
)

type Commit struct {
	Type        CommitType
	Scope       string // Optional
	Description string
	Body        string // Optional
	Breaking    bool   // Breaking change indicator
}

const (
	MaxDescriptionLength = 72
	MaxBodyLineLength    = 72
	MaxBodyLength        = 500
)

// Validate checks if the commit adheres to Conventional Commits specification
func (c *Commit) Validate() error {
	if !c.Type.IsValid() {
		return shared.WrapError(shared.ErrInvalidCommitType, fmt.Sprintf("commit type: %s", c.Type.Name))
	}

	if err := c.validateDescription(); err != nil {
		return shared.WrapError(err, "validating commit description")
	}

	if err := c.validateScope(); err != nil {
		return shared.WrapError(err, "validating commit scope")
	}

	if err := c.validateBody(); err != nil {
		return shared.WrapError(err, "validating commit body")
	}

	return nil
}

// Format constructs the commit message string according to Conventional Commits specification
func (c *Commit) Format() string {
	var builder strings.Builder

	builder.WriteString(c.Type.Name)

	if c.HasScope() {
		builder.WriteString("(")
		builder.WriteString(c.Scope)
		builder.WriteString(")")
	}

	if c.IsBreaking() {
		builder.WriteString("!")
	}

	builder.WriteString(": ")
	builder.WriteString(c.Description)

	if c.Body != "" {
		builder.WriteString("\n\n")
		builder.WriteString(c.formatBody())
	}

	if c.IsBreaking() {
		builder.WriteString("\n\nBREAKING CHANGE: ")
		if c.Body != "" {
			builder.WriteString("This commit introduces a breaking change.")
		}
	}

	return builder.String()
}

// IsBreaking indicates if the commit is a breaking change
func (c *Commit) IsBreaking() bool {
	return c.Breaking
}

// HasScope indicates if the commit has a non-empty scope
func (c *Commit) HasScope() bool {
	return strings.TrimSpace(c.Scope) != ""
}

// validateDescription checks if the description is non-empty and within length limits
func (c *Commit) validateDescription() error {
	if strings.TrimSpace(c.Description) == "" {
		return shared.WrapError(shared.ErrEmptyDescription, "description is empty or whitespace")
	}

	if utf8.RuneCountInString(c.Description) > MaxDescriptionLength {
		return shared.WrapError(shared.ErrDescriptionTooLong, fmt.Sprintf("description length: %d characters (max %d)", utf8.RuneCountInString(c.Description), MaxDescriptionLength))
	}

	return nil
}

// validateScope checks if the scope is valid (alphanumeric, hyphens, underscores)
func (c *Commit) validateScope() error {
	if c.Scope == "" {
		return nil
	}

	// Scope should be alphanumeric and may include hyphens/underscores
	scope := strings.TrimSpace(c.Scope)

	if scope != c.Scope || strings.ContainsAny(scope, " \t\n()") {
		return shared.WrapError(shared.ErrInvalidScopeFormat, "scope contains invalid characters")
	}

	return nil
}

// validateBody checks if the body is within length limits
func (c *Commit) validateBody() error {
	if c.Body == "" {
		return nil
	}

	if utf8.RuneCountInString(c.Body) > MaxBodyLength {
		return shared.WrapError(shared.ErrBodyTooLong, fmt.Sprintf("body length: %d characters (max %d)", utf8.RuneCountInString(c.Body), MaxBodyLength))
	}

	return nil
}

func (c *Commit) formatBody() string {
	if c.Body == "" {
		return ""
	}

	lines := strings.Split(c.Body, "\n")
	var formattedLines []string

	for _, line := range lines {
		if utf8.RuneCountInString(line) <= MaxBodyLineLength {
			formattedLines = append(formattedLines, line)
		} else {
			words := strings.Fields(line)
			var currentLine strings.Builder

			for _, word := range words {
				if currentLine.Len()+len(word)+1 > MaxBodyLineLength {
					formattedLines = append(formattedLines, currentLine.String())
					currentLine.Reset()
				}
				if currentLine.Len() > 0 {
					currentLine.WriteString(" ")
				}
				currentLine.WriteString(word)
			}
			if currentLine.Len() > 0 {
				formattedLines = append(formattedLines, currentLine.String())
			}
		}
	}

	return strings.Join(formattedLines, "\n")
}
