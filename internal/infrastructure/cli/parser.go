package cli

import (
	"flag"
	"fmt"

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

	fs := flag.NewFlagSet("easy-commit", flag.ContinueOnError)
	fs.StringVar(&config.TypeName, "type", "", "Commit type")
	fs.StringVar(&config.Description, "message", "", "Commit description")
	fs.StringVar(&config.Scope, "scope", "", "Commit scope")
	fs.BoolVar(&config.Breaking, "breaking", false, "Indicate a breaking change")
	fs.BoolVar(&config.Interactive, "interactive", true, "Run in interactive mode")
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
	fmt.Printf("Usage: %s <command> [options]\n", p.appName)
	fmt.Printf("Version: %s\n", p.version)
	fmt.Println("Available commands:")

	for name, cmd := range p.commands {
		fmt.Printf(" %s - %s", name, cmd.Description)
	}
}
