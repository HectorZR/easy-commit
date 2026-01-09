# Easy Commit CLI

[![Release](https://img.shields.io/github/v/release/HectorZR/easy-commit)](https://github.com/HectorZR/easy-commit/releases)
[![Go Version](https://img.shields.io/github/go-mod/go-version/HectorZR/easy-commit)](https://github.com/HectorZR/easy-commit/blob/main/go.mod)
[![CI Status](https://github.com/HectorZR/easy-commit/workflows/CI/badge.svg)](https://github.com/HectorZR/easy-commit/actions)
[![License](https://img.shields.io/github/license/HectorZR/easy-commit)](https://github.com/HectorZR/easy-commit/blob/main/LICENSE.md)

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

### Quick Install (Recommended)

Install or update easy-commit with a single command:

**Linux/macOS:**
```bash
curl -sSL https://raw.githubusercontent.com/HectorZR/easy-commit/main/install.sh | sh
```

**Windows (Git Bash/WSL):**
```bash
curl -sSL https://raw.githubusercontent.com/HectorZR/easy-commit/main/install.sh | sh
```

The installer will:
- ✅ Detect your OS and architecture automatically
- ✅ Download the latest release from GitHub
- ✅ Verify integrity with SHA256 checksums
- ✅ Install to `/usr/local/bin` or `~/.local/bin`
- ✅ Check for updates and upgrade automatically

**Custom installation:**
```bash
# Install specific version
VERSION=v1.0.0 curl -sSL https://raw.githubusercontent.com/HectorZR/easy-commit/main/install.sh | sh

# Custom installation directory
INSTALL_DIR=/custom/path curl -sSL https://raw.githubusercontent.com/HectorZR/easy-commit/main/install.sh | sh

# Skip checksum verification
SKIP_VERIFY=1 curl -sSL https://raw.githubusercontent.com/HectorZR/easy-commit/main/install.sh | sh

# Force reinstall
FORCE=1 curl -sSL https://raw.githubusercontent.com/HectorZR/easy-commit/main/install.sh | sh
```

---

### Alternative Installation Methods

#### Option 1: Download Pre-built Binary

Download the latest binary for your platform from the [releases page](https://github.com/HectorZR/easy-commit/releases/latest).

**Linux/macOS:**
```bash
# Download (replace VERSION and PLATFORM with your choices, e.g., v1.0.0, linux_amd64)
curl -LO https://github.com/HectorZR/easy-commit/releases/download/VERSION/easy-commit_VERSION_PLATFORM.tar.gz

# Extract
tar -xzf easy-commit_VERSION_PLATFORM.tar.gz

# Move to PATH
sudo mv easy-commit /usr/local/bin/

# Verify installation
easy-commit --version
```

**Windows (PowerShell):**
```powershell
# Download the .zip file from the releases page
# Extract the archive
# Move easy-commit.exe to a directory in your PATH
```

#### Option 2: Install with Go

If you have Go installed (1.24 or later):

```bash
go install github.com/hector/easy-commit/cmd/easy-commit@latest
```

#### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/HectorZR/easy-commit.git
cd easy-commit

# Build using Makefile
make build

# Or build directly with Go
go build -o easy-commit ./cmd/easy-commit

# (Optional) Install globally
make install
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
make test

# With race detector
make test-race

# With coverage
make test-coverage

# Specific tests
go test ./internal/domain -v
go test ./internal/application -v
```

## 🚀 Release Management

This project uses [GoReleaser](https://goreleaser.com/) for automated releases.

### For Users

All releases are available on the [releases page](https://github.com/HectorZR/easy-commit/releases) with pre-built binaries for multiple platforms.

### For Maintainers

To create a new release:

```bash
# Create and push a semantic version tag
git tag v1.0.1
git push origin v1.0.1
```

GitHub Actions will automatically build and publish the release with binaries for all supported platforms.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed release guidelines.

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
