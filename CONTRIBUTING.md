# Contributing to Easy Commit

First off, thank you for considering contributing to Easy Commit! 🎉

## Code of Conduct

This project follows the Go community [Code of Conduct](https://golang.org/conduct). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [issue tracker](https://github.com/HectorZR/easy-commit/issues) to avoid duplicates.

When creating a bug report, include:
- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **Environment details** (OS, Go version)
- **Logs or error messages** if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:
- **Use a clear and descriptive title**
- **Provide detailed explanation** of the proposed feature
- **Explain why this enhancement would be useful**
- **Include examples** if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** if applicable
4. **Ensure tests pass** (`make test`)
5. **Update documentation** if needed
6. **Commit using Conventional Commits** (see below)
7. **Push to your fork** and submit a pull request

## Development Process

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/easy-commit.git
cd easy-commit

# Install dependencies
go mod download

# Build the project
make build

# Run tests
make test
```

### Making Changes

```bash
# Create a feature branch
git checkout -b feat/my-new-feature

# Make your changes
# ...

# Run tests
make test

# Build and test locally
make build
./easy-commit --version
```

### Commit Message Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/). All commits **must** follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no behavior change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI configuration changes
- `perf`: Performance improvements

**Examples:**

```bash
feat: add support for custom commit templates
fix: resolve issue with scope validation
docs: update installation instructions
refactor: simplify validator logic
test: add tests for git executor
```

**Breaking Changes:**

Mark breaking changes by adding `!` after the type or by including `BREAKING CHANGE:` in the footer:

```bash
feat!: change API structure for commit service

BREAKING CHANGE: The CommitService.Create method now requires a context parameter.
```

### Running Tests

```bash
# Run all tests
make test

# Run with race detector
make test-race

# Run with coverage
make test-coverage

# Run specific package tests
go test -v ./internal/domain
go test -v ./internal/application
```

### Code Style

- Follow standard Go conventions (`gofmt`, `go vet`)
- Use meaningful variable names
- Add comments for exported functions, types, and packages
- Keep functions focused and small
- Write table-driven tests when appropriate

```bash
# Format code
go fmt ./...

# Run linter (if installed)
make lint
```

## Project Architecture

Easy Commit follows **Clean Architecture** with three layers:

```
Domain → Application → Infrastructure
```

- **Domain Layer** (`internal/domain/`): Core business logic, no external dependencies
- **Application Layer** (`internal/application/`): Use cases, orchestrates domain objects
- **Infrastructure Layer** (`internal/infrastructure/`): External concerns (CLI, Git, TUI)

**Golden Rule:** Never import from a higher layer into a lower layer.

See [AGENTS.md](AGENTS.md) for detailed architecture documentation.

## Release Process

Releases are automated using GoReleaser and follow [Semantic Versioning](https://semver.org/).

### Version Guidelines

- **MAJOR** (v2.0.0): Breaking changes, incompatible API changes
- **MINOR** (v1.1.0): New features, backwards compatible
- **PATCH** (v1.0.1): Bug fixes, backwards compatible

The version is determined automatically based on commit messages:
- Commits with `feat:` increment MINOR
- Commits with `fix:` increment PATCH
- Commits with `BREAKING CHANGE:` or `!` increment MAJOR

### Creating a Release (Maintainers Only)

1. Ensure all changes are merged to `main`
2. All tests pass on `main` branch
3. Create and push a tag:

```bash
# Decide version based on changes
# - Bug fixes only: patch (v1.0.1)
# - New features: minor (v1.1.0)
# - Breaking changes: major (v2.0.0)

git checkout main
git pull origin main

# Create annotated tag
git tag -a v1.0.1 -m "Release v1.0.1: Bug fixes and improvements"

# Push tag (triggers release workflow)
git push origin v1.0.1
```

4. GitHub Actions will automatically:
   - Run all tests
   - Build binaries for all platforms (Linux, macOS, Windows)
   - Generate changelog
   - Create GitHub release
   - Upload binaries and checksums

5. Verify the release on [GitHub Releases](https://github.com/HectorZR/easy-commit/releases)

### Pre-release Versions

For alpha, beta, or release candidate versions:

```bash
git tag v1.1.0-alpha.1
git tag v1.1.0-beta.1
git tag v1.1.0-rc.1
```

GoReleaser will automatically mark these as pre-releases.

## Testing Releases Locally

Before creating a tag, test the release process:

```bash
# Install goreleaser (if not installed)
brew install goreleaser/tap/goreleaser

# Validate configuration
make goreleaser-check

# Build snapshot (local test without publishing)
make goreleaser-snapshot

# Check artifacts in dist/
ls -la dist/
```

## Documentation

When making changes:
- Update `README.md` if user-facing features change
- Update `AGENTS.md` if architecture or development process changes
- Add entries to `CHANGELOG.md` (or let GoReleaser generate it)
- Update code comments for exported functions

## Questions?

If you have questions or need help:
- Check [AGENTS.md](AGENTS.md) for project details
- Open a [GitHub Discussion](https://github.com/HectorZR/easy-commit/discussions)
- Open an [Issue](https://github.com/HectorZR/easy-commit/issues)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE.md).
