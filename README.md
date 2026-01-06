# Easy Commit CLI

A Go CLI application to create commits following the Conventional Commits specification interactively.

## 🎯 Features

- ✅ **Interactive TUI Mode**: Modern terminal UI with keyboard navigation (powered by Bubble Tea)
- ✅ **Arrow Key Navigation**: Navigate commit types with ↑/↓ keys
- ✅ **Real-time Validation**: Character count and validation feedback as you type
- ✅ **Search & Filter**: Press `/` to search through commit types
- ✅ **Back Navigation**: Use Ctrl+B to go back and edit previous steps
- ✅ **Direct Mode**: Create commits from command line with flags
- ✅ **Validation**: Validates commits according to Conventional Commits
- ✅ **Preview**: Beautiful commit preview with styled boxes
- ✅ **Concurrency**: Concurrent validation using worker pools
- ✅ **Clean Architecture**: Layer separation (Domain, Application, Infrastructure)
- ✅ **Professional UI**: Colorful and friendly interface with lipgloss styling

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/hector/easy-commit.git
cd easy-commit

# Build
go build -o easy-commit ./cmd/easy-commit

# (Optional) Install globally
go install ./cmd/easy-commit
```

## 🚀 Usage

### Interactive Mode (Recommended)

Simply run the command without arguments:

```bash
./easy-commit
```

The CLI will guide you step by step with a modern TUI:

**Navigation:**
- **↑/↓ Arrow Keys**: Navigate through commit types
- **/** : Search/filter commit types
- **Enter**: Confirm selection and advance
- **Ctrl+B**: Go back to previous step
- **Ctrl+C / Esc**: Cancel at any time

**Steps:**
1. Select the commit type (feat, fix, docs, etc.) - with arrow key navigation
2. Enter the change description - with real-time character count
3. (Optional) Enter the scope
4. (Optional) Enter the body
5. (Optional) Mark as breaking change - toggle with arrow keys or Y/N
6. Preview the commit in a styled box
7. Confirm to create the commit

### Direct Mode (CLI Flags)

Create commits directly from the command line:

```bash
# Simple commit
./easy-commit --type feat --message "add user authentication"

# With scope
./easy-commit --type fix --scope auth --message "fix login bug"

# Breaking change
./easy-commit --type feat --message "change API structure" --breaking

# Preview without creating commit (dry-run)
./easy-commit --type docs --message "update readme" --dry-run
```

### Available Flags

```
-t, --type <TYPE>          Commit type (feat, fix, docs, style, refactor, test, chore, build, ci, perf)
-m, --message <MESSAGE>    Commit description
-s, --scope <SCOPE>        Commit scope (optional)
-b, --breaking             Mark as breaking change
-i, --interactive          Force interactive mode
-n, --dry-run              Show preview without creating commit
-h, --help                 Show help
-v, --version              Show version
```

## 📝 Commit Types

| Type       | Description                                                                                       |
|------------|---------------------------------------------------------------------------------------------------|
| `feat`     | New feature                                                                                       |
| `fix`      | Bug fix                                                                                           |
| `docs`     | Documentation only changes                                                                        |
| `style`    | Changes that don't affect the meaning of the code (formatting, whitespace, etc.)                  |
| `refactor` | Code change that neither adds functionality nor fixes bugs                                        |
| `test`     | Adding or correcting tests                                                                        |
| `chore`    | Changes to the build process or auxiliary tools                                                   |
| `build`    | Changes that affect the build system or external dependencies                                     |
| `ci`       | Changes to CI configuration                                                                       |
| `perf`     | Changes that improve performance                                                                  |

## 🏗️ Architecture

The project follows **Clean Architecture** with 3-layer separation:

```
easy-commit/
├── cmd/easy-commit/              # Entry point
│   └── main.go
├── internal/
│   ├── domain/                   # Domain Layer (entities, value objects)
│   │   ├── commit.go
│   │   ├── config.go
│   │   ├── types.go
│   │   └── repository.go
│   ├── application/              # Application Layer (use cases)
│   │   ├── commit_service.go
│   │   ├── interactive_flow.go
│   │   └── validator.go
│   ├── infrastructure/           # Infrastructure Layer
│   │   ├── cli/
│   │   │   └── parser.go
│   │   ├── git/
│   │   │   └── executor.go
│   │   ├── terminal/
│   │   │   ├── input.go
│   │   │   └── output.go
│   │   └── tui/                  # NEW: Bubble Tea TUI components
│   │       ├── model.go          # Main Bubble Tea model
│   │       ├── views.go          # View rendering functions
│   │       ├── messages.go       # Custom messages/events
│   │       ├── styles.go         # Lipgloss styles
│   │       └── components/       # Reusable UI components
│   │           ├── type_selector.go
│   │           ├── text_input.go
│   │           ├── confirmation.go
│   │           └── preview.go
│   └── shared/                   # Shared utilities
│       ├── errors.go
│       └── logger.go
└── test/                         # Tests
    ├── integration/
    │   └── tui_integration_test.go  # NEW: TUI integration tests
    └── internal/
        └── domain_test.go
```

## 🧪 Testing

```bash
# Run all tests
go test ./...

# With coverage
go test -cover ./...

# Specific tests
go test ./internal/domain -v
```

## 🔧 Advanced Go Concepts Implemented

### 1. Terminal User Interface (TUI) with Bubble Tea
- **The Elm Architecture (TEA)**: Functional reactive programming pattern
- **Model-Update-View**: Pure functions for state management
- **Event-driven architecture**: Handling keyboard input and window events
- **Component composition**: Reusable UI components (list, textinput, etc.)

### 2. Concurrency Patterns
- **Worker Pool Pattern**: Concurrent validation in `validator.go`
- Use of `goroutines`, `channels`, and `sync.WaitGroup`
- Context for cancellation and timeouts

### 3. Clean Architecture
- Layer separation (Domain → Application → Infrastructure)
- Dependency Injection
- Repository Pattern
- Interfaces for decoupling

### 4. Testing
- **Unit tests**: Testing individual components and models
- **Integration tests**: Testing complete flows end-to-end
- Table-driven tests
- Coverage tracking

### 5. Error Handling
- Custom error types
- Error wrapping with context
- Graceful error handling

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Bubble Tea Framework](https://github.com/charmbracelet/bubbletea)
- [Bubbles Components](https://github.com/charmbracelet/bubbles)
- [Lipgloss Styling](https://github.com/charmbracelet/lipgloss)
- [Go Concurrency Patterns](https://go.dev/blog/pipelines)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 📄 License

MIT License - see [LICENSE.md](LICENSE.md)

## 👤 Author

Hector Zurga

## 🎓 Educational Purpose

This project was created for educational purposes to:
- Learn concurrency patterns in Go
- Practice Clean Architecture
- Master Terminal UI development with Bubble Tea
- Implement The Elm Architecture (TEA) pattern in Go
- Build modern CLI applications with keyboard navigation
- Implement advanced testing strategies (unit + integration)
