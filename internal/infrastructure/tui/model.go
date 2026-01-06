package tui

import (
	"context"
	"fmt"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/textinput"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/hector/easy-commit/internal/application"
	"github.com/hector/easy-commit/internal/domain"
	"github.com/hector/easy-commit/internal/infrastructure/tui/components"
)

// Step represents the current step in the flow
type Step int

const (
	StepTypeSelect Step = iota
	StepDescription
	StepScope
	StepBody
	StepBreaking
	StepPreview
	StepConfirm
	StepCreating
	StepDone
)

// Model is the main Bubble Tea model for the interactive flow
type Model struct {
	// Current state
	currentStep Step
	width       int
	height      int

	// Components
	typeList        list.Model
	descInput       textinput.Model
	scopeInput      textinput.Model
	bodyInput       textinput.Model
	breakingConfirm components.ConfirmationState
	finalConfirm    components.ConfirmationState

	// Data
	commit      *domain.Commit
	commitTypes domain.CommitTypes
	service     *application.CommitService
	ctx         context.Context

	// State
	err       error
	cancelled bool
	quitting  bool
}

// NewModel creates a new Bubble Tea model for commit creation
func NewModel(
	service *application.CommitService,
	commitTypes domain.CommitTypes,
	ctx context.Context,
) Model {
	// Initialize commit with config from service
	commit := domain.NewCommit(&service.GetConfig().Commit)

	// Initialize components
	typeList := components.NewTypeList(commitTypes, 80, 12)
	descInput := components.NewDescriptionInput()
	scopeInput := components.NewScopeInput()
	bodyInput := components.NewBodyInput()
	breakingConfirm := components.NewConfirmation("Is this a breaking change?")
	finalConfirm := components.NewConfirmation("Create this commit?")

	return Model{
		currentStep:     StepTypeSelect,
		typeList:        typeList,
		descInput:       descInput,
		scopeInput:      scopeInput,
		bodyInput:       bodyInput,
		breakingConfirm: breakingConfirm,
		finalConfirm:    finalConfirm,
		commit:          commit,
		commitTypes:     commitTypes,
		service:         service,
		ctx:             ctx,
		width:           80,
		height:          24,
	}
}

// Init initializes the model
func (m Model) Init() tea.Cmd {
	return textinput.Blink
}

// Update handles all events and returns updated model
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		return m.handleKeyPress(msg)

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		m.typeList.SetSize(msg.Width-4, msg.Height-10)
		return m, nil

	case CommitCreatedMsg:
		if msg.Success {
			m.currentStep = StepDone
		} else {
			m.err = msg.Error
		}
		return m, nil
	}

	// Delegate to active component
	return m.updateActiveComponent(msg)
}

// handleKeyPress handles keyboard input
func (m Model) handleKeyPress(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "ctrl+c", "esc":
		m.cancelled = true
		m.quitting = true
		return m, tea.Quit

	case "ctrl+b":
		// Go back to previous step
		if m.currentStep > StepTypeSelect {
			m.currentStep--
			m.focusCurrentStep()
		}
		return m, nil

	case "enter":
		return m.handleEnter()

	case "left", "right", "h", "l":
		// Toggle confirmations with left/right
		if m.currentStep == StepBreaking {
			m.breakingConfirm.Toggle()
			return m, nil
		}
		if m.currentStep == StepConfirm {
			m.finalConfirm.Toggle()
			return m, nil
		}

	case "y", "Y":
		// Quick yes for confirmations
		if m.currentStep == StepBreaking {
			m.breakingConfirm.YesSelected = true
			return m.handleEnter()
		}
		if m.currentStep == StepConfirm {
			m.finalConfirm.YesSelected = true
			return m.handleEnter()
		}

	case "n", "N":
		// Quick no for confirmations
		if m.currentStep == StepBreaking {
			m.breakingConfirm.YesSelected = false
			return m.handleEnter()
		}
		if m.currentStep == StepConfirm {
			m.finalConfirm.YesSelected = false
			m.cancelled = true
			m.quitting = true
			return m, tea.Quit
		}
	}

	// Let active component handle other keys
	return m.updateActiveComponent(msg)
}

// handleEnter processes the Enter key based on current step
func (m Model) handleEnter() (tea.Model, tea.Cmd) {
	switch m.currentStep {
	case StepTypeSelect:
		// Get selected type
		selectedType, ok := components.GetSelectedType(m.typeList)
		if ok {
			m.commit.Type = selectedType
			m.currentStep = StepDescription
			m.descInput.Focus()
		}
		return m, nil

	case StepDescription:
		// Validate description
		desc := m.descInput.Value()
		validation := components.ValidateDescription(desc)
		if !validation.Valid {
			m.err = fmt.Errorf("validation error: %s", validation.Message)
			return m, nil
		}
		m.commit.Description = desc
		m.err = nil
		m.currentStep = StepScope
		m.scopeInput.Focus()
		return m, nil

	case StepScope:
		// Scope is optional
		m.commit.Scope = m.scopeInput.Value()
		m.currentStep = StepBody
		m.bodyInput.Focus()
		return m, nil

	case StepBody:
		// Body is optional
		m.commit.Body = m.bodyInput.Value()
		m.currentStep = StepBreaking
		return m, nil

	case StepBreaking:
		// Save breaking change selection
		m.commit.Breaking = m.breakingConfirm.GetValue()
		m.currentStep = StepPreview
		return m, nil

	case StepPreview:
		// Move to confirmation
		m.currentStep = StepConfirm
		return m, nil

	case StepConfirm:
		if m.finalConfirm.GetValue() {
			// User confirmed, create commit
			m.currentStep = StepCreating
			return m, m.createCommit()
		}
		// User declined
		m.cancelled = true
		m.quitting = true
		return m, tea.Quit

	case StepDone:
		m.quitting = true
		return m, tea.Quit
	}

	return m, nil
}

// updateActiveComponent delegates message to the active component
func (m Model) updateActiveComponent(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd

	switch m.currentStep {
	case StepTypeSelect:
		m.typeList, cmd = m.typeList.Update(msg)

	case StepDescription:
		m.descInput, cmd = m.descInput.Update(msg)

	case StepScope:
		m.scopeInput, cmd = m.scopeInput.Update(msg)

	case StepBody:
		m.bodyInput, cmd = m.bodyInput.Update(msg)
	}

	return m, cmd
}

// focusCurrentStep sets focus to the current step's input
func (m *Model) focusCurrentStep() {
	switch m.currentStep {
	case StepDescription:
		m.descInput.Focus()
	case StepScope:
		m.scopeInput.Focus()
	case StepBody:
		m.bodyInput.Focus()
	}
}

// createCommit executes the git commit command
func (m Model) createCommit() tea.Cmd {
	return func() tea.Msg {
		err := m.service.CreateCommit(m.ctx, m.commit)
		if err != nil {
			return CommitCreatedMsg{Success: false, Error: err}
		}
		return CommitCreatedMsg{Success: true}
	}
}

// View renders the UI
func (m Model) View() string {
	return RenderView(m)
}

// IsCancelled returns true if user cancelled
func (m Model) IsCancelled() bool {
	return m.cancelled
}

// GetCommit returns the built commit
func (m Model) GetCommit() *domain.Commit {
	return m.commit
}

// GetError returns any error that occurred
func (m Model) GetError() error {
	return m.err
}
