# Easy Commit CLI

[![Release](https://img.shields.io/github/v/release/HectorZR/easy-commit)](https://github.com/HectorZR/easy-commit/releases)
[![CI Status](https://github.com/HectorZR/easy-commit/workflows/CI/badge.svg)](https://github.com/HectorZR/easy-commit/actions)
[![License](https://img.shields.io/github/license/HectorZR/easy-commit)](https://github.com/HectorZR/easy-commit/blob/main/LICENSE.md)

A modern CLI application built with TypeScript and Bun to create commits following the [Conventional Commits](https://www.conventionalcommits.org/) specification with an interactive terminal UI.

> **Note**: This is the TypeScript + Bun version of easy-commit. If you're looking for the Go version, see the [go-legacy branch](https://github.com/HectorZR/easy-commit/tree/go-legacy). See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for migration information.

## ✨ Features

- 🎨 **Interactive TUI Mode**: Beautiful terminal UI powered by [ink](https://github.com/vadimdemedes/ink) (React for CLI)
- ⚡ **Ultra-fast Runtime**: Built with [Bun](https://bun.sh) for blazing-fast performance
- ✅ **Real-time Validation**: Instant feedback as you type
- 🔄 **Back Navigation**: Go back and edit previous steps
- 📝 **Direct Mode**: Create commits from command line with flags
- 🎯 **Smart Defaults**: Sensible defaults with full customization
- 🧪 **100% Test Coverage**: Comprehensive unit, integration, and E2E tests
- 🏗️ **Clean Architecture**: Maintainable three-layer architecture
- 🎭 **Type Safety**: Full TypeScript with strict mode
- 🚀 **Standalone Binary**: No dependencies required

## 📦 Installation

### Option 1: Download Pre-built Binary (Recommended)

Download the latest standalone binary for your platform from the [releases page](https://github.com/HectorZR/easy-commit/releases/latest):

**Linux:**
```bash
# x64
curl -LO https://github.com/HectorZR/easy-commit/releases/latest/download/easy-commit-linux-x64.tar.gz
tar -xzf easy-commit-linux-x64.tar.gz
sudo mv easy-commit-linux-x64 /usr/local/bin/easy-commit
```

**macOS:**
```bash
# Intel (x64)
curl -LO https://github.com/HectorZR/easy-commit/releases/latest/download/easy-commit-darwin-x64.tar.gz
tar -xzf easy-commit-darwin-x64.tar.gz
sudo mv easy-commit-darwin-x64 /usr/local/bin/easy-commit

# Apple Silicon (arm64)
curl -LO https://github.com/HectorZR/easy-commit/releases/latest/download/easy-commit-darwin-arm64.tar.gz
tar -xzf easy-commit-darwin-arm64.tar.gz
sudo mv easy-commit-darwin-arm64 /usr/local/bin/easy-commit
```

**Windows:**
```powershell
# Download from releases page and extract
# Move easy-commit-windows-x64.exe to a directory in your PATH
```

### Option 2: Install with Bun

If you have Bun installed:

```bash
bun install -g easy-commit
```

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/HectorZR/easy-commit.git
cd easy-commit

# Install dependencies
bun install

# Build standalone binary
bun run build:standalone

# The binary will be created as ./easy-commit
```

## 🚀 Quick Start

### Interactive Mode (Recommended)

Simply run the command without arguments:

```bash
easy-commit
```

The CLI will guide you through an interactive wizard:

**Navigation:**
- **↑/↓ Arrow Keys**: Navigate through options
- **Enter**: Confirm selection
- **Backspace**: Go back to previous step
- **Ctrl+C / Esc**: Cancel at any time

**Wizard Steps:**
1. 📋 Select commit type (feat, fix, docs, etc.)
2. ✍️  Enter description
3. 🏷️  Enter scope (optional)
4. 📄 Enter body (optional)
5. ⚠️  Mark as breaking change (optional)
6. 👀 Preview commit
7. ✅ Confirm and create commit

### Direct Mode (CLI Flags)

Create commits directly from the command line:

```bash
# Simple commit
easy-commit -t feat -m "add user authentication"

# With scope
easy-commit -t fix -s auth -m "fix login bug"

# Breaking change
easy-commit -t feat -m "change API structure" --breaking

# Preview without creating commit (dry-run)
easy-commit --dry-run -t docs -m "update readme"
```

## 📖 Usage

### Available Flags

```
-t, --type <type>        Commit type (feat, fix, docs, etc.)
-m, --message <message>  Commit description
-s, --scope <scope>      Commit scope (optional)
-b, --breaking           Mark as breaking change
-i, --interactive        Force interactive mode
--dry-run                Preview commit without creating it
-h, --help               Show help
-V, --version            Show version
```

### Examples

```bash
# Feature with scope
easy-commit -t feat -s api -m "add user endpoints"

# Bug fix with breaking change
easy-commit -t fix -m "update authentication flow" -b

# Documentation update
easy-commit -t docs -m "improve installation guide"

# Dry run to preview
easy-commit --dry-run -t refactor -m "simplify validation logic"

# Force interactive mode even with flags
easy-commit -i -t feat -m "initial message"
```

## 📝 Commit Types

| Type       | Description                                                      |
|------------|------------------------------------------------------------------|
| `feat`     | A new feature                                                    |
| `fix`      | A bug fix                                                        |
| `docs`     | Documentation only changes                                       |
| `style`    | Code style changes (formatting, semicolons, etc.)                |
| `refactor` | Code refactoring (no behavior change)                            |
| `test`     | Adding or updating tests                                         |
| `chore`    | Maintenance tasks                                                |
| `build`    | Build system changes                                             |
| `ci`       | CI configuration changes                                         |
| `perf`     | Performance improvements                                         |

## ⚙️ Configuration

Create a `.easy-commit.yaml` file in your project root or home directory:

```yaml
# Commit message limits
commit:
  maxDescriptionLength: 72
  maxBodyLength: 500
  invalidChars: []

# Timeouts (in milliseconds)
timeouts:
  validation: 5000
  gitCommand: 5000
  userInput: 300000  # 5 minutes
  context: 60000     # 1 minute

# Concurrent validator workers
validator:
  workers: 4

# Logging
logger:
  level: INFO  # DEBUG, INFO, WARN, ERROR, SILENT
```

See [`.easy-commit.example.yaml`](./.easy-commit.example.yaml) for a complete example.

## 🏗️ Architecture

The project follows **Clean Architecture** with three-layer separation:

```
easy-commit/
├── src/
│   ├── domain/              # Domain Layer (pure business logic)
│   │   ├── entities/        # Commit, CommitType
│   │   ├── repositories/    # Repository interfaces
│   │   ├── errors.ts        # Domain errors
│   │   └── types.ts         # Domain types
│   │
│   ├── application/         # Application Layer (use cases)
│   │   ├── services/        # CommitService
│   │   └── validators/      # ConcurrentValidator
│   │
│   ├── infrastructure/      # Infrastructure Layer (external)
│   │   ├── cli/            # CLI argument parsing (commander)
│   │   ├── git/            # Git executor (Bun.spawn)
│   │   ├── config/         # YAML config loader (js-yaml + zod)
│   │   ├── logger/         # Simple logger
│   │   └── ui/             # TUI with ink (React for terminal)
│   │       ├── App.tsx     # Main app component
│   │       ├── components/ # Reusable components
│   │       ├── screens/    # Wizard screens
│   │       ├── hooks/      # Custom hooks
│   │       └── styles.ts   # Colors and styles
│   │
│   ├── shared/             # Shared utilities
│   ├── index.ts            # Entry point
│   └── version.ts          # Version info
│
├── tests/                  # Tests by layer
│   ├── unit/              # Unit tests (167 tests)
│   ├── integration/       # Integration tests
│   └── e2e/               # E2E tests (13 tests)
│
├── scripts/               # Build scripts
└── .github/workflows/     # CI/CD pipelines
```

**Key Design Principles:**
- **Dependency Inversion**: Domain layer has no dependencies
- **Single Responsibility**: Each module has one job
- **Interface Segregation**: Small, focused interfaces
- **Separation of Concerns**: Clear layer boundaries

## 🧪 Development

### Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- Git
- Node.js 18+ (for TypeScript support)

### Setup

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Run with arguments
bun run dev --help
bun run dev --dry-run -t feat -m "test"
```

### Testing

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/unit/domain/commit.test.ts

# Watch mode
bun test --watch
```

**Test Results:**
- 180 total tests
- 86.90% code coverage
- 94.94% line coverage
- Unit, integration, and E2E tests

### Linting & Formatting

```bash
# Lint code
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format

# Type check
bun run typecheck
```

### Building

```bash
# Build for distribution (outputs to dist/)
bun run build

# Build standalone binary
bun run build:standalone

# Quick build without version injection
bun run build:quick
```

## 📊 Performance

Benchmarks on MacBook Pro (M1):

| Operation | Time | Target |
|-----------|------|--------|
| Startup | ~91ms | < 500ms |
| Commit Creation | ~125ms | < 2s |
| Validation | ~100ms | < 1s |
| Binary Size | 57 MB | < 100MB |

All benchmarks well within acceptable ranges. ✅

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Quick Start:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`bun test`)
5. Commit using this tool (`./easy-commit` or `bun run dev`)
6. Push to your fork and open a Pull Request

## 📚 Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Bun Documentation](https://bun.sh/docs)
- [ink Documentation](https://github.com/vadimdemedes/ink)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## 📄 License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## 👤 Author

**Hector Zurga**

- GitHub: [@HectorZR](https://github.com/HectorZR)

## 🙏 Acknowledgments

- [Bun](https://bun.sh) - Ultra-fast JavaScript runtime
- [ink](https://github.com/vadimdemedes/ink) - React for CLIs
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Conventional Commits](https://www.conventionalcommits.org/) - Specification

---

**Made with ❤️ and TypeScript**
