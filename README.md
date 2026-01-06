# Easy Commit CLI

A Go CLI application to create commits following the Conventional Commits specification interactively.

## 🎯 Features

- ✅ **Interactive Mode**: Step-by-step guide to create commits
- ✅ **Direct Mode**: Create commits from command line with flags
- ✅ **Validation**: Validates commits according to Conventional Commits
- ✅ **Preview**: Preview the message before creating the commit
- ✅ **Concurrency**: Concurrent validation using worker pools
- ✅ **Clean Architecture**: Layer separation (Domain, Application, Infrastructure)
- ✅ **Zero Dependencies**: Only uses Go standard library
- ✅ **ANSI Colors**: Colorful and friendly interface

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

The CLI will guide you step by step:
1. Select the commit type (feat, fix, docs, etc.)
2. Enter the change description
3. (Optional) Enter the scope
4. (Optional) Enter the body
5. (Optional) Mark as breaking change
6. Preview the commit
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
│   │   └── terminal/
│   │       ├── input.go
│   │       └── output.go
│   └── shared/                   # Shared utilities
│       ├── errors.go
│       └── logger.go
└── test/                         # Tests
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

### 1. Concurrency Patterns
- **Worker Pool Pattern**: Concurrent validation in `validator.go`
- Use of `goroutines`, `channels`, and `sync.WaitGroup`
- Context for cancellation and timeouts

### 2. Clean Architecture
- Layer separation (Domain → Application → Infrastructure)
- Dependency Injection
- Repository Pattern
- Interfaces for decoupling

### 3. Testing
- Table-driven tests
- Tests with multiple cases
- Coverage tracking

### 4. Error Handling
- Custom error types
- Error wrapping with context
- Graceful error handling

## 📚 Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
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
- Implement advanced testing
- Build CLI applications without external dependencies
