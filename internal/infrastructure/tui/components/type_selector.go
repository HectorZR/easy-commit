package components

import (
	"fmt"
	"io"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/hector/easy-commit/internal/domain"
)

var (
	itemStyle         = lipgloss.NewStyle().PaddingLeft(2)
	selectedItemStyle = lipgloss.NewStyle().PaddingLeft(1).Foreground(lipgloss.Color("170")).Bold(true)
	descStyle         = lipgloss.NewStyle().Foreground(lipgloss.Color("240"))
)

// CommitTypeItem wraps a domain.CommitType for use with bubbles list
type CommitTypeItem struct {
	Type domain.CommitType
}

func (i CommitTypeItem) Title() string {
	return i.Type.Name
}

func (i CommitTypeItem) Description() string {
	return i.Type.Description
}

func (i CommitTypeItem) FilterValue() string {
	return i.Type.Name
}

// CommitTypeDelegate is a custom delegate for rendering commit types
type CommitTypeDelegate struct{}

func (d CommitTypeDelegate) Height() int {
	return 1
}

func (d CommitTypeDelegate) Spacing() int {
	return 0
}

func (d CommitTypeDelegate) Update(msg tea.Msg, m *list.Model) tea.Cmd {
	return nil
}

func (d CommitTypeDelegate) Render(w io.Writer, m list.Model, index int, item list.Item) {
	i, ok := item.(CommitTypeItem)
	if !ok {
		return
	}

	var str string
	if index == m.Index() {
		str = selectedItemStyle.Render("▸ " + i.Title())
		str += " "
		str += descStyle.Render("- " + i.Description())
	} else {
		str = itemStyle.Render("  " + i.Title())
		str += " "
		str += descStyle.Render("- " + i.Description())
	}

	fmt.Fprint(w, str)
}

// NewTypeList creates a new list model with commit types
func NewTypeList(types domain.CommitTypes, width, height int) list.Model {
	items := make([]list.Item, len(types))
	for i, t := range types {
		items[i] = CommitTypeItem{Type: t}
	}

	delegate := CommitTypeDelegate{}
	l := list.New(items, delegate, width, height)
	l.Title = "Select Commit Type"
	l.SetShowStatusBar(false)
	l.SetFilteringEnabled(true)
	l.Styles.Title = lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("62")).
		Padding(0, 0, 1, 0)

	return l
}

// GetSelectedType returns the currently selected commit type
func GetSelectedType(l list.Model) (domain.CommitType, bool) {
	item := l.SelectedItem()
	if item == nil {
		return domain.CommitType{}, false
	}

	commitTypeItem, ok := item.(CommitTypeItem)
	if !ok {
		return domain.CommitType{}, false
	}

	return commitTypeItem.Type, true
}
