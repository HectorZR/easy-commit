package cli

import (
	"flag"
	"fmt"
	"strings"

	"github.com/hector/easy-commit/internal/domain"
)

type Command struct {
	Name        string
	Description string
	Handler     func(args []string) error
	Flags       *flag.FlagSet
}

type Parser struct {
	commands map[string]*Command
	appName  string
	version  string
}

// NewParser creates a new Parser instance with the given application name and version.
func NewParser(appName, version string) *Parser {
	return &Parser{
		commands: make(map[string]*Command),
		appName:  appName,
		version:  version,
	}
}

// RegisterCommand registers a new command with the parser.
func (p *Parser) RegisterCommand(cmd *Command) {
	p.commands[cmd.Name] = cmd
}

// Parse parses the command-line arguments and executes the corresponding command handler.
func (p *Parser) Parse(args []string) (*domain.CLIConfig, error) {
	config := &domain.CLIConfig{}

	if len(args) == 0 {
		return config, config.Validate()
	}

	fs := flag.NewFlagSet("easy-commit", flag.ContinueOnError)
	fs.StringVar(&config.TypeName, "type", "", "Commit type")
	fs.StringVar(&config.Description, "message", "", "Commit description")
	fs.StringVar(&config.Scope, "scope", "", "Commit scope")
	fs.BoolVar(&config.Breaking, "breaking", false, "Indicate a breaking change")
	fs.BoolVar(&config.Interactive, "interactive", false, "Run in interactive mode")
	fs.BoolVar(&config.DryRun, "dry-run", false, "Show the commit message without creating it")
	fs.BoolVar(&config.Help, "help", false, "Show help message")
	fs.BoolVar(&config.Version, "version", false, "Show version information")

	err := fs.Parse(args)
	if err != nil {
		return nil, err
	}

	return config, config.Validate()
}

// ShowHelp displays the help message with available commands.
func (p *Parser) ShowHelp() {
	var message strings.Builder

	message.WriteString(fmt.Sprintf("%s - Interactive Conventional Commits\n", p.appName))
	message.WriteString("USAGE:\n")
	message.WriteString(fmt.Sprintf("	%s [FLAGS]\n", p.appName))
	message.WriteString("FLAGS:\n")
	for _, flag := range []struct {
		short string
		long  string
		desc  string
	}{
		{"-t", "--type <TYPE>", "Commit type (feat, fix, docs, style, refactor, test, chore)"},
		{"-m", "--message <MESSAGE>", "Commit description"},
		{"-s", "--scope <SCOPE>", "Commit scope (optional)"},
		{"-b", "--breaking", "Mark as breaking change"},
		{"-i", "--interactive", "Force interactive mode"},
		{"-n", "--dry-run", "Show preview without committing"},
		{"-h", "--help", "Show this help message"},
		{"-v", "--version", "Show version information"},
	} {
		message.WriteString(fmt.Sprintf("   %-2s, %-25s %s\n", flag.short, flag.long, flag.desc))
	}
	message.WriteString("EXAMPLES:\n")
	message.WriteString(fmt.Sprintf("   %s # Interactive mode\n", p.appName))
	message.WriteString(fmt.Sprintf("   %s -t feat -m \"add user authentication\"\n", p.appName))
	message.WriteString(fmt.Sprintf("   %s --type fix --scope auth --message \"fix login bug\"\n", p.appName))
	message.WriteString(fmt.Sprintf("   %s --dry-run --type docs --message \"update readme\"\n", p.appName))
	message.WriteString("\n")
	message.WriteString("COMMIT TYPES:\n")

	for _, ct := range (domain.CommitTypes{}).GetDefault() {
		message.WriteString(fmt.Sprintf("   %-10s %s\n", ct.Name, ct.Description))
	}
	fmt.Print(message.String())
}
