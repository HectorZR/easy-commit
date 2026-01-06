# AGENTS.md

## Project Overview

Easy Commit CLI is a Go application for creating commits that follow the Conventional Commits specification. The project features:
- Interactive Terminal User Interface (TUI) built with Bubble Tea framework
- Clean Architecture with three-layer separation (Domain, Application, Infrastructure)
- Concurrent validation using worker pools
- Support for both interactive and direct CLI modes

## Setup Commands

```bash
# Install dependencies
go mod download

# Build the project
go build -o easy-commit ./cmd/easy-commit

# Run in development
go run ./cmd/easy-commit

# Install globally
go install ./cmd/easy-commit

# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific package tests
go test ./internal/domain -v
go test ./internal/application -v
go test ./test/integration -v
```

## Project Structure

The project follows Clean Architecture principles with strict layer separation:

```
easy-commit/
├── cmd/easy-commit/          # Entry point (main.go)
├── internal/
│   ├── domain/              # Domain layer: entities, value objects, interfaces
│   ├── application/         # Application layer: use cases, services
│   ├── infrastructure/      # Infrastructure layer: external implementations
│   │   ├── cli/            # CLI argument parsing
│   │   ├── git/            # Git command execution
│   │   ├── terminal/       # Terminal I/O (legacy)
│   │   └── tui/            # Bubble Tea TUI components
│   ├── config/             # Configuration management
│   └── shared/             # Shared utilities (errors, logger)
└── test/                    # Tests (integration and unit)
```

## Architecture Guidelines

### Layer Responsibilities

**Domain Layer** (`internal/domain/`):
- Contains core business entities and value objects
- Defines repository interfaces
- No external dependencies
- Pure Go types and logic

**Application Layer** (`internal/application/`):
- Implements use cases and business logic
- Orchestrates domain objects
- Depends only on domain layer
- Contains validators and services

**Infrastructure Layer** (`internal/infrastructure/`):
- Implements domain interfaces
- Handles external concerns (git, terminal, TUI)
- Depends on application and domain layers
- Contains framework-specific code

### Dependency Flow

Always respect the dependency direction:
```
Infrastructure → Application → Domain
```

Never import from a higher layer into a lower layer.

## Code Style and Conventions

### General Go Conventions
- Follow standard Go formatting (`gofmt` compliant)
- Use meaningful variable names (no single-letter variables except for short scopes)
- Use `camelCase` for private members, `PascalCase` for public
- Group imports: standard library, external packages, internal packages
- Add comments for exported functions, types, and packages

### Error Handling
- Use custom error types from `shared/errors.go`
- Wrap errors with context using `fmt.Errorf` with `%w`
- Return errors, don't panic (except in truly unrecoverable situations)
- Log errors at appropriate levels using the shared logger

### Bubble Tea TUI Development

When working with the TUI (`internal/infrastructure/tui/`):

**The Elm Architecture (TEA)**:
- `Model`: Contains all state, must be immutable
- `Update`: Pure function that handles messages and returns new model
- `View`: Pure function that renders the UI from model state

**Key principles**:
- Never mutate the model directly
- All state changes happen in `Update` function
- Use commands (`tea.Cmd`) for side effects
- Components are in `tui/components/` directory

**Navigation flow**:
1. Type Selection → 2. Description Input → 3. Scope Input → 4. Body Input → 5. Breaking Change → 6. Preview → 7. Confirmation

### Configuration

Configuration is loaded from `.easy-commit.yaml` (optional):
- Falls back to defaults if file not found
- See `.easy-commit.example.yaml` for structure
- Config struct is in `internal/config/`
- Use `config.LoadOrDefault()` to load

## Testing Guidelines

### Test Organization
- Unit tests: Place next to the file being tested (`foo.go` → `foo_test.go`)
- Integration tests: Place in `test/integration/`
- Use table-driven tests for multiple scenarios
- Mock external dependencies (git commands, I/O)

### Test Naming
- Test functions: `TestFunctionName_Scenario`
- Subtests: `t.Run("description of scenario", func(t *testing.T) {...})`

### Coverage Expectations
- Aim for >80% coverage on domain and application layers
- TUI components may have lower coverage due to I/O complexity
- Always test error paths, not just happy paths

## Git Workflow

### Commit Messages
This project uses its own tool! Commits should follow Conventional Commits:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Use the CLI itself to create commits:
```bash
./easy-commit
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting (no logic change)
- `refactor`: Code refactoring (no behavior change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI configuration changes
- `perf`: Performance improvements

### Breaking Changes
Mark breaking changes using:
- The `--breaking` flag in CLI mode
- The breaking change prompt in interactive mode
- Adds `BREAKING CHANGE:` footer to commit message

## Common Tasks

### Adding a New Commit Type
1. Update `internal/domain/types.go` with new type
2. Add description to the `CommitTypes` map
3. Update README.md documentation
4. Add tests in `internal/domain/types_test.go`

### Adding a New TUI Component
1. Create file in `internal/infrastructure/tui/components/`
2. Implement Bubble Tea model interface (`Init`, `Update`, `View`)
3. Add styling in `tui/styles.go`
4. Integrate into main model in `tui/model.go`
5. Add integration test in `test/integration/tui_integration_test.go`

### Modifying Validation Rules
1. Update validators in `internal/application/validator.go`
2. Update config defaults in `internal/config/defaults.go`
3. Update example config in `.easy-commit.example.yaml`
4. Add corresponding tests

### Adding New CLI Flags
1. Update parser in `internal/infrastructure/cli/parser.go`
2. Update help text in parser
3. Update README.md usage section
4. Test both interactive and direct modes

## Dependencies

Key external libraries:
- **Bubble Tea**: TUI framework (github.com/charmbracelet/bubbletea)
- **Bubbles**: TUI components (github.com/charmbracelet/bubbles)
- **Lipgloss**: Terminal styling (github.com/charmbracelet/lipgloss)
- **YAML v3**: Config parsing (gopkg.in/yaml.v3)

Keep dependencies minimal and avoid adding new ones unless necessary.

## Performance Considerations

### Concurrent Validation
- Uses worker pool pattern for validation (`application/validator.go`)
- Default: 4 workers (configurable in `.easy-commit.yaml`)
- Validates multiple rules in parallel using goroutines and channels

### Git Command Execution
- Git commands have configurable timeouts
- Default timeout: 5s (see `config/defaults.go`)
- Commands are executed synchronously but with timeout context

## Security Notes

- No sensitive data is stored or logged
- Git credentials are handled by git itself (not this tool)
- All user input is validated before git execution
- No shell injection vulnerabilities (uses exec.CommandContext properly)

## Known Limitations

1. Requires a git repository (checks on startup)
2. TUI requires terminal with ANSI color support
3. Arrow key navigation may not work in all terminal emulators
4. No support for GPG signing (must be configured in git config)
5. Does not support multi-line descriptions (by design, per Conventional Commits)

## Debugging

Enable debug logging:
```yaml
# .easy-commit.yaml
logger:
  level: DEBUG
```

Or check the code directly:
- Logger calls are in `shared/logger.go`
- Service logic in `application/commit_service.go`
- Git execution in `infrastructure/git/executor.go`

## Resources

- [Conventional Commits Spec](https://www.conventionalcommits.org/)
- [Bubble Tea Documentation](https://github.com/charmbracelet/bubbletea)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Go Concurrency Patterns](https://go.dev/blog/pipelines)
- [GoReleaser Documentation](https://goreleaser.com/)
- [Semantic Versioning](https://semver.org/)

## Release Process

### Versioning Strategy

This project follows **Semantic Versioning 2.0.0** (MAJOR.MINOR.PATCH):
- **MAJOR** (v2.0.0): Breaking changes, incompatible API changes
- **MINOR** (v1.1.0): New features, backwards compatible
- **PATCH** (v1.0.1): Bug fixes, backwards compatible

Version is injected at build-time using ldflags. **Never hardcode version in code.**

### Build-Time Version Injection

The version information is stored in variables that are overridden during build:

```go
// cmd/easy-commit/main.go
var (
    version = "dev"      // Default for development builds
    commit  = "none"     // Git commit hash
    date    = "unknown"  // Build date
    builtBy = "unknown"  // Builder (goreleaser/local/manual)
)
```

**Local builds:**
```bash
# Development build (version=dev)
make build

# Simulated release build
make build-release VERSION=v1.0.0

# Manual with all flags
go build -ldflags "\
  -X main.version=v1.0.0 \
  -X main.commit=$(git rev-parse --short HEAD) \
  -X main.date=$(date -u '+%Y-%m-%d_%H:%M:%S') \
  -X main.builtBy=manual" \
  ./cmd/easy-commit
```

**Production builds (GoReleaser):**
GoReleaser automatically injects the correct values for all variables.

### Release Workflow

**1. Development Phase**
```bash
# Commit using Conventional Commits
git commit -m "feat: add new validation rule"
git commit -m "fix: resolve scope parsing issue"
git commit -m "docs: update installation instructions"
```

**2. Prepare for Release**
```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Verify tests pass
make test

# (Optional) Test local build
make build
./easy-commit --version
```

**3. Create Release**
```bash
# Decide version based on commits since last release:
# - Only bug fixes? → Patch (v1.0.1)
# - New features? → Minor (v1.1.0)
# - Breaking changes? → Major (v2.0.0)

# Create annotated tag
git tag -a v1.0.1 -m "Release v1.0.1: Bug fixes and improvements"

# Push tag (triggers GitHub Actions release workflow)
git push origin v1.0.1
```

**4. Automated CI/CD Process**

GitHub Actions automatically:
1. ✅ Runs all tests (unit, integration, race detector)
2. ✅ Builds binaries for 5 platforms:
   - Linux (amd64, arm64)
   - macOS (amd64, arm64)
   - Windows (amd64)
3. ✅ Generates CHANGELOG from commits
4. ✅ Creates compressed archives (.tar.gz, .zip)
5. ✅ Generates SHA256 checksums
6. ✅ Creates GitHub Release
7. ✅ Uploads all artifacts

**5. Post-Release Verification**
```bash
# Check release on GitHub
open https://github.com/HectorZR/easy-commit/releases

# Test installation via go install
go install github.com/hector/easy-commit/cmd/easy-commit@v1.0.1

# Verify version
easy-commit --version
# Output: easy-commit v1.0.1 (abc123f) built on 2026-01-06_10:30:00 by goreleaser

# Download and verify binary
curl -LO https://github.com/HectorZR/easy-commit/releases/download/v1.0.1/easy-commit_v1.0.1_checksums.txt
curl -LO https://github.com/HectorZR/easy-commit/releases/download/v1.0.1/easy-commit_v1.0.1_linux_amd64.tar.gz
sha256sum -c easy-commit_v1.0.1_checksums.txt
```

### GoReleaser Configuration

**Configuration file:** `.goreleaser.yaml`

**Key features:**
- Multi-platform builds with optimized binaries (`-s -w` ldflags)
- Automatic CHANGELOG generation from Conventional Commits
- Commit grouping by type (Features, Bug Fixes, etc.)
- Excludes `chore:`, `test:`, `style:` from CHANGELOG
- Checksums for integrity verification
- Custom release notes with installation instructions

**Local testing:**
```bash
# Install goreleaser
brew install goreleaser/tap/goreleaser

# Validate configuration
make goreleaser-check

# Test build without publishing (snapshot)
make goreleaser-snapshot

# Check artifacts
ls -la dist/
```

### Makefile Commands

Development commands available:

```bash
make help                # Show all available commands
make build               # Build development binary (version=dev)
make build-release       # Build release binary with version
make install             # Install binary globally
make run                 # Build and run
make test                # Run all tests
make test-race           # Run tests with race detector
make test-coverage       # Run tests with coverage report
make lint                # Run linter (requires golangci-lint)
make clean               # Remove build artifacts
make deps                # Download and tidy dependencies
make goreleaser-check    # Validate GoReleaser config
make goreleaser-snapshot # Test release build locally
```

### Version Determination Guidelines

**Based on Conventional Commits:**

| Commit Type | Version Impact | Example |
|-------------|---------------|---------|
| `feat:` | MINOR (v1.0.0 → v1.1.0) | New feature added |
| `fix:` | PATCH (v1.0.0 → v1.0.1) | Bug fixed |
| `feat!:` or `BREAKING CHANGE:` | MAJOR (v1.0.0 → v2.0.0) | API changed |
| `docs:`, `chore:`, `style:` | No version change | Documentation only |

**Examples:**

```bash
# Patch release (bug fixes only)
git commit -m "fix: resolve parsing error in scope validation"
git tag v1.0.1

# Minor release (new features)
git commit -m "feat: add support for custom commit templates"
git tag v1.1.0

# Major release (breaking changes)
git commit -m "feat!: change commit service API structure"
git tag v2.0.0

# Or with footer
git commit -m "feat: restructure validator" -m "BREAKING CHANGE: Validator interface changed"
git tag v2.0.0
```

### Pre-release Versions

For testing or preview releases:

```bash
# Alpha versions
git tag v1.1.0-alpha.1
git tag v1.1.0-alpha.2

# Beta versions
git tag v1.1.0-beta.1

# Release candidates
git tag v1.1.0-rc.1
```

GoReleaser automatically marks these as pre-releases on GitHub.

### Continuous Integration

**CI Workflow** (`.github/workflows/ci.yml`):
- Triggers on: Push to `main`, Pull Requests
- Runs on: Multiple Go versions (1.24, 1.25)
- Jobs:
  - Tests (with race detector and coverage)
  - Build smoke test
  - Linting (golangci-lint)

**Release Workflow** (`.github/workflows/release.yml`):
- Triggers on: Git tags matching `v*`
- Jobs:
  - Run full test suite
  - Execute GoReleaser
  - Upload artifacts (retained for 7 days)

### Troubleshooting Releases

**Issue: Tag already exists**
```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag (careful!)
git push origin :refs/tags/v1.0.0
```

**Issue: Release failed in CI**
```bash
# Check GitHub Actions logs
open https://github.com/HectorZR/easy-commit/actions

# Common causes:
# - Tests failing
# - GoReleaser config error
# - Missing GITHUB_TOKEN (should be automatic)
```

**Issue: Version not injected correctly**
```bash
# Verify ldflags in .goreleaser.yaml
grep -A 5 "ldflags:" .goreleaser.yaml

# Test locally
make build
./easy-commit --version
```

### Release Checklist

Before creating a release tag:

- [ ] All changes merged to `main`
- [ ] Tests pass locally (`make test`)
- [ ] CHANGELOG.md updated (or will be auto-generated)
- [ ] Version number decided (MAJOR.MINOR.PATCH)
- [ ] Tag message prepared
- [ ] Post-release announcement planned (optional)

## Questions?

When implementing new features:
1. Determine which layer the change belongs to (Domain/Application/Infrastructure)
2. Start from the domain layer and work outward
3. Keep business logic in application layer, not infrastructure
4. Update tests before or alongside implementation
5. Run full test suite before committing
6. Use Conventional Commits for all changes
7. Create releases using semantic version tags
