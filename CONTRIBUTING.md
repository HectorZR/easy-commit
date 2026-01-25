# Contributing to Easy Commit

First off, thank you for considering contributing to Easy Commit! 🎉

## Code of Conduct

This project follows a standard code of conduct based on the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code and treat all contributors with respect.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the [issue tracker](https://github.com/HectorZR/easy-commit/issues) to avoid duplicates.

When creating a bug report, include:
- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **Environment details** (OS, Bun version, Node version if applicable)
- **Logs or error messages** if applicable
- **Version information** (`easy-commit --version`)

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

### Prerequisites

You'll need:
- **Bun** v1.1 or later ([installation guide](https://bun.sh))
- **Git** (obviously!)
- **Node.js** 18+ (optional, for npm compatibility)

### Setup Development Environment

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/easy-commit.git
cd easy-commit

# 3. Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# 4. Install dependencies
bun install

# 5. Verify setup works
bun run dev --version

# 6. Run tests to ensure everything is working
bun test
```

### Development Workflow

```bash
# 1. Create a feature branch
git checkout -b feat/my-new-feature

# 2. Make your changes
# ...

# 3. Run linter and formatter
bun run lint:fix
bun run format

# 4. Type check
bun run typecheck

# 5. Run tests
bun test

# 6. Run tests with coverage (aim for >80%)
bun test --coverage

# 7. Test in dev mode
bun run dev

# 8. Build and test standalone binary
bun run build:standalone
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
chore: update dependencies
```

**Using Easy Commit for Commits:**

The best way to create commits for this project? Use easy-commit itself!

```bash
# Interactive mode (recommended)
bun run dev

# Or direct mode
bun run dev -t feat -m "add new feature"
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
bun test

# Run tests in watch mode (for development)
bun test --watch

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/unit/domain/commit.test.ts

# Run E2E tests only
bun test tests/e2e/

# Run performance benchmarks
bun test tests/e2e/performance.test.ts
```

**Coverage Expectations:**
- Domain layer: >90% coverage
- Application layer: >80% coverage
- Infrastructure layer: >70% coverage
- Overall: >80% coverage

### Code Style

This project uses **Biome** for linting and formatting (replaces ESLint + Prettier).

**Key Style Guidelines:**
- Use TypeScript strict mode (no `any` without good reason)
- Use `const` over `let`, never use `var`
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use PascalCase for classes and types, camelCase for variables and functions
- File names: kebab-case (e.g., `commit-service.ts`)
- Add JSDoc comments for exported functions and classes
- Keep functions small and focused
- Write descriptive test names

**Automatic Formatting:**

```bash
# Format all files
bun run format

# Check without modifying
bun run lint

# Fix linting issues automatically
bun run lint:fix

# Type check (no auto-fix)
bun run typecheck
```

**File naming conventions:**
- Source files: `kebab-case.ts` (e.g., `commit-service.ts`)
- Test files: `kebab-case.test.ts` (e.g., `commit-service.test.ts`)
- React components: `PascalCase.tsx` (e.g., `CommitPreview.tsx`)
- Types/Interfaces: PascalCase in any `.ts` file

## Project Architecture

Easy Commit follows **Clean Architecture** with three layers:

```
Infrastructure → Application → Domain
```

**Layer Responsibilities:**

- **Domain Layer** (`src/domain/`): 
  - Core business entities (Commit, CommitType)
  - Value objects (Description, Scope)
  - Repository interfaces
  - Domain errors
  - Pure TypeScript, no external dependencies

- **Application Layer** (`src/application/`): 
  - Use cases and business workflows
  - Services (CommitService)
  - Validators (ConcurrentValidator)
  - Depends only on domain layer

- **Infrastructure Layer** (`src/infrastructure/`):
  - External concerns (CLI, Git, Config, TUI, Logger)
  - Framework-specific code (ink, commander, Bun APIs)
  - Implements domain interfaces
  - Depends on application and domain layers

**Golden Rule:** Always respect dependency direction. Never import from a higher layer into a lower layer.

```typescript
// ✅ GOOD: Infrastructure imports from Application
import { CommitService } from '@application/services/CommitService';

// ❌ BAD: Domain imports from Infrastructure
import { GitExecutor } from '@infrastructure/git/GitExecutor';
```

**Additional Guidelines:**
- Keep business logic in domain/application layers
- Keep framework code in infrastructure layer
- Use dependency injection for testability
- Write tests for each layer independently

See [AGENTS.md](AGENTS.md) for detailed architecture documentation and guidelines.

## TUI Development

The interactive TUI is built with **ink** (React for terminal).

**Key Concepts:**
- Functional components with hooks
- Use `useState` for local state
- Use `useInput` for keyboard handling
- Use `useEffect` for side effects

**Screen Structure:**
```
src/infrastructure/ui/
├── App.tsx              # Main app component with state machine
├── components/          # Reusable components
├── screens/             # Wizard screens (7 screens)
├── hooks/               # Custom hooks
└── styles.ts            # Colors and styling
```

**Testing UI Components:**
Use `ink-testing-library` for component tests:

```typescript
import { render } from 'ink-testing-library';
import MyComponent from './MyComponent';

test('should render component', () => {
  const { lastFrame } = render(<MyComponent />);
  expect(lastFrame()).toContain('Expected text');
});
```

## Release Process

Releases are automated using GitHub Actions and follow [Semantic Versioning](https://semver.org/).

### Version Guidelines

- **MAJOR** (v2.0.0): Breaking changes, incompatible API changes
- **MINOR** (v1.1.0): New features, backwards compatible
- **PATCH** (v1.0.1): Bug fixes, backwards compatible

The version is determined based on commit messages:
- Commits with `feat:` increment MINOR
- Commits with `fix:` increment PATCH
- Commits with `BREAKING CHANGE:` or `!` increment MAJOR

### Creating a Release (Maintainers Only)

1. Ensure all changes are merged to `main`
2. All tests pass on `main` branch
3. Decide version number based on commits
4. Create and push a tag:

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
   - Run all tests (unit, integration, E2E)
   - Type check and lint
   - Build binaries for all platforms:
     - Linux (x64, arm64)
     - macOS (x64, arm64) 
     - Windows (x64)
   - Generate CHANGELOG from commits
   - Create compressed archives (.tar.gz)
   - Generate SHA256 checksums
   - Create GitHub release with artifacts
   - Upload all binaries

5. Verify the release on [GitHub Releases](https://github.com/HectorZR/easy-commit/releases)

### Pre-release Versions

For alpha, beta, or release candidate versions:

```bash
git tag v1.1.0-alpha.1   # Alpha release
git tag v1.1.0-beta.1    # Beta release
git tag v1.1.0-rc.1      # Release candidate
```

GitHub Actions will automatically mark these as pre-releases.

## Testing Releases Locally

Before creating a tag, test the build process:

```bash
# Build standalone binary
bun run build:standalone

# Test the binary
./easy-commit --version
./easy-commit --help

# Test interactive mode
cd /path/to/test/repo
/path/to/easy-commit

# Verify size and startup time
ls -lh easy-commit
time ./easy-commit --version
```

**Expected Build Output:**
- Binary size: ~50-60 MB
- Startup time: <100ms
- All features working

## Documentation

When making changes, update relevant documentation:

- **README.md** - User-facing features, installation, usage examples
- **AGENTS.md** - Architecture, development guidelines, project setup
- **CONTRIBUTING.md** - Contribution guidelines (this file)
- **MIGRATION_GUIDE.md** - Migration instructions from Go to TypeScript version
- **Code comments** - JSDoc for exported functions and classes

**Documentation Standards:**
- Keep examples up-to-date and working
- Include code examples for complex features
- Document all public APIs
- Update version numbers after releases
- Add screenshots/recordings for UI changes (optional)

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style (Biome passes)
- [ ] Type checking passes (`bun run typecheck`)
- [ ] All tests pass (`bun test`)
- [ ] Coverage remains above 80% (`bun test --coverage`)
- [ ] New features have tests
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow Conventional Commits
- [ ] PR description explains what/why, not just how
- [ ] No merge conflicts with `main`
- [ ] Local build works (`bun run build:standalone`)

**PR Title Format:**
Use Conventional Commits format:
```
feat: add custom commit templates
fix: resolve scope validation issue
docs: update README installation section
```

## Common Tasks

### Adding a New Commit Type

1. Update `src/domain/entities/commit-type.ts`:
   ```typescript
   export const COMMIT_TYPES: CommitType[] = [
     // ... existing types
     { name: 'newtype', description: 'Description of new type' },
   ];
   ```

2. Add tests in `tests/unit/domain/commit-type.test.ts`

3. Update README.md to document the new type

4. Run tests: `bun test`

### Adding a New TUI Screen

1. Create component in `src/infrastructure/ui/screens/`

2. Implement React component with ink:
   ```typescript
   import { Box, Text } from 'ink';
   import { useState } from 'react';
   
   export default function MyScreen() {
     return <Box>...</Box>;
   }
   ```

3. Add to state machine in `App.tsx`

4. Add keyboard handling with `useInput`

5. Add integration test in `tests/integration/ui/`

### Modifying Validation Rules

1. Update validators in `src/application/validators/concurrent-validator.ts`

2. Update config schema in `src/infrastructure/config/config-loader.ts`

3. Update `.easy-commit.example.yaml`

4. Add tests in `tests/unit/application/`

### Adding New CLI Flags

1. Update `src/infrastructure/cli/cli-parser.ts`

2. Add new option to commander:
   ```typescript
   .option('--my-flag <value>', 'description')
   ```

3. Update help text

4. Update README.md usage section

5. Add tests in `tests/unit/infrastructure/cli-parser.test.ts`

## Questions?

If you have questions or need help:
- Check [AGENTS.md](AGENTS.md) for project architecture and guidelines
- Check [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) if migrating from Go version
- Check [README.md](README.md) for user documentation
- Search existing [Issues](https://github.com/HectorZR/easy-commit/issues)
- Open a new [Issue](https://github.com/HectorZR/easy-commit/issues/new) with questions

## Useful Commands Reference

```bash
# Development
bun run dev                    # Run in development mode
bun run dev --help             # Show help

# Testing
bun test                       # Run all tests
bun test --watch               # Run tests in watch mode
bun test --coverage            # Run with coverage
bun test tests/unit/           # Run unit tests only
bun test tests/e2e/            # Run E2E tests only

# Building
bun run build                  # Build to dist/
bun run build:standalone       # Build standalone binary
bun run build:quick            # Quick build (no version injection)

# Quality
bun run lint                   # Check code style
bun run lint:fix               # Fix code style issues
bun run format                 # Format code
bun run typecheck              # Type check

# Cleaning
bun run clean                  # Remove build artifacts
```

## Technology Stack

- **Runtime**: Bun (ultra-fast JavaScript runtime)
- **Language**: TypeScript (strict mode)
- **TUI**: ink v6 (React for terminal)
- **CLI**: commander v14
- **Config**: js-yaml + Zod (validation)
- **Testing**: Bun test (Jest-compatible)
- **Linting**: Biome (replaces ESLint + Prettier)
- **Build**: Bun bundler + compiler

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [ink Documentation](https://github.com/vadimdemedes/ink)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Semantic Versioning](https://semver.org/)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE.md).
