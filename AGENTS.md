# AGENTS.md

## Project Overview

Easy Commit CLI is a TypeScript application for creating commits that follow the Conventional Commits specification. The project features:
- Interactive Terminal User Interface (TUI) built with ink (React for terminal)
- Clean Architecture with three-layer separation (Domain, Application, Infrastructure)
- Async validation with Promise-based concurrency
- Support for both interactive and direct CLI modes
- Ultra-fast runtime powered by Bun

**Migration Status:** This project is being migrated from Go to TypeScript + Bun. See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for details.

## Setup Commands

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Build the project
bun run build

# Build standalone binary
bun run build:standalone

# Run in development
bun run dev

# Install globally (after build)
bun link

# Run tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch

# Lint and format
bun run lint
bun run format

# Type checking
bun run typecheck
```

## Architecture Guidelines

### Layer Responsibilities

**Domain Layer** (`src/domain/`):
- Contains core business entities and value objects
- Defines repository interfaces
- No external dependencies (pure TypeScript)
- Business logic and validation rules

**Application Layer** (`src/application/`):
- Implements use cases and business workflows
- Orchestrates domain objects
- Depends only on domain layer
- Contains services and validators

**Infrastructure Layer** (`src/infrastructure/`):
- Implements domain interfaces
- Handles external concerns (git, terminal, TUI, config)
- Depends on application and domain layers
- Contains framework-specific code (ink, commander, etc.)

### Dependency Flow

Always respect the dependency direction:
```
Infrastructure → Application → Domain
```

Never import from a higher layer into a lower layer.

## Code Style and Conventions

### TypeScript Conventions
- Follow TypeScript best practices and ESLint rules
- The created files must be named with kebab-case
- Use Biome for consistent formatting
- Use `camelCase` for variables and functions, `PascalCase` for classes and types
- Prefer `const` over `let`, avoid `var`
- Use type annotations for function parameters and return types
- Prefer `interface` for object shapes, `type` for unions/intersections
- Add JSDoc comments for exported functions and classes

### Error Handling
- Use custom error classes from `domain/errors.ts` and `shared/errors.ts`
- Throw errors for exceptional cases
- Use try-catch blocks for async operations
- Log errors appropriately using the shared logger
- Provide meaningful error messages with context

### ink TUI Development

When working with the TUI (`src/infrastructure/ui/`):

**React Component Pattern**:
- Functional components with hooks
- `useState` for local state
- `useInput` for keyboard handling
- `useEffect` for side effects

**Key principles**:
- Keep components small and focused
- Use custom hooks for complex state logic
- Handle navigation with state machines
- Separate presentation from logic

**Navigation flow**:
1. Type Selection → 2. Description Input → 3. Scope Input → 4. Body Input → 5. Breaking Change → 6. Preview → 7. Confirmation

### Configuration

Configuration is loaded from `.easy-commit.yaml` (optional):
- Falls back to defaults if file not found
- See `.easy-commit.example.yaml` for structure
- Config validation with Zod schema
- Use `ConfigLoader.loadOrDefault()` to load

## Testing Guidelines

### Test Organization
- Unit tests: Place in `tests/unit/` organized by layer
- Integration tests: Place in `tests/integration/`
- E2E tests: Place in `tests/e2e/`
- Use descriptive test names
- Test both success and error paths

### Test Framework
Use Bun's built-in test runner (Jest-compatible API):
```typescript
import { describe, test, expect, beforeEach, mock } from 'bun:test';

describe('Component', () => {
  test('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

### Mocking
- Use `mock()` from `bun:test` for function mocks
- Create mock implementations for interfaces
- Use `ink-testing-library` for UI component testing

### Coverage Expectations
- Aim for >80% coverage on domain and application layers
- UI components may have lower coverage due to interactivity
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
bun run dev
# or
./easy-commit  # if built
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
1. Update `src/domain/entities/commit-type.ts` with new type
2. Add to `COMMIT_TYPES` array with description
3. Update README.md documentation
4. Add tests in `tests/unit/domain/commit-type.test.ts`

### Adding a New TUI Screen
1. Create component in `src/infrastructure/ui/screens/`
2. Implement React component with ink components
3. Add keyboard handling with `useInput` hook
4. Add styling in `ui/styles.ts`
5. Integrate into App.tsx state machine
6. Add integration test in `tests/integration/ui/`

### Modifying Validation Rules
1. Update validators in `src/application/validators/concurrent-validator.ts`
2. Update config schema in `src/infrastructure/config/config-loader.ts`
3. Update example config in `.easy-commit.example.yaml`
4. Add corresponding tests

### Adding New CLI Flags
1. Update parser in `src/infrastructure/cli/cli-parser.ts`
2. Update help text in parser
3. Update README.md usage section
4. Test both interactive and direct modes

## Dependencies

### Core Runtime
- **Bun**: Ultra-fast JavaScript runtime and bundler
- **TypeScript**: Type-safe JavaScript

### TUI Framework
- **ink**: React for terminal (github.com/vadimdemedes/ink)
- **React**: UI library (used by ink)
- **ink-text-input**: Text input component
- **ink-select-input**: Select/list component
- **ink-box**: Box component for layouts
- **chalk**: Terminal colors

### Infrastructure
- **commander**: CLI argument parsing
- **js-yaml**: YAML configuration parsing
- **zod**: Schema validation for config

### Development
- **@biomejs/biome**: Fast linter and formatter (replaces ESLint + Prettier)
- **ink-testing-library**: Testing utilities for ink components

Keep dependencies minimal and avoid adding new ones unless necessary.

## Performance Considerations

### Async Validation
- Uses `Promise.all()` for concurrent validation
- Default: 4 concurrent validators (configurable in `.easy-commit.yaml`)
- Validates multiple rules in parallel using async/await

### Git Command Execution
- Git commands executed via `Bun.spawn()`
- Configurable timeouts (default: 5s)
- Real-time output streaming with `stdout: 'inherit'`

### Bun Advantages
- Ultra-fast startup time (~3x faster than Node.js)
- Built-in TypeScript support (no transpilation needed)
- Native bundler and test runner
- Efficient process spawning

## Security Notes

- No sensitive data is stored or logged
- Git credentials are handled by git itself (not this tool)
- All user input is validated before git execution
- No command injection vulnerabilities (uses spawn with array arguments)

## Known Limitations

1. Requires a git repository (checks on startup)
2. TUI requires terminal with ANSI color support
3. Arrow key navigation may not work in all terminal emulators
4. No support for GPG signing (must be configured in git config)
5. Does not support multi-line descriptions (by design, per Conventional Commits)
6. Requires Bun runtime (unless using standalone binary)

## Debugging

Enable debug logging:
```yaml
# .easy-commit.yaml
logger:
  level: DEBUG
```

Or check the code directly:
- Logger calls are in `infrastructure/logger/logger.ts`
- Service logic in `application/services/commit-service.ts`
- Git execution in `infrastructure/git/git-executor.ts`

Debug TUI components:
```typescript
// Use console.error in components (stdout is used by ink)
console.error('Debug:', { state });
```

## Resources

- [Conventional Commits Spec](https://www.conventionalcommits.org/)
- [ink Documentation](https://github.com/vadimdemedes/ink)
- [Bun Documentation](https://bun.sh/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Semantic Versioning](https://semver.org/)

## Release Process

### Versioning Strategy

This project follows **Semantic Versioning 2.0.0** (MAJOR.MINOR.PATCH):
- **MAJOR** (v2.0.0): Breaking changes, incompatible API changes
- **MINOR** (v1.1.0): New features, backwards compatible
- **PATCH** (v1.0.1): Bug fixes, backwards compatible

Version is injected at build-time via environment variables.

### Build-Time Version Injection

The version information is stored in variables set during build:

```typescript
// src/version.ts
export const VERSION = process.env.VERSION || 'dev';
export const COMMIT = process.env.COMMIT || 'none';
export const BUILD_DATE = process.env.BUILD_DATE || 'unknown';
export const BUILT_BY = process.env.BUILT_BY || 'unknown';
```

**Local builds:**
```bash
# Development build (version=dev)
bun run build

# Build with version info
VERSION=v1.0.0 bun run build:standalone

# Build script handles version injection
bun run scripts/build.ts
```

**Production builds:**
GitHub Actions automatically injects the correct values for all variables.

### Release Workflow

**1. Development Phase**
```bash
# Commit using Conventional Commits
bun run dev  # Use the tool itself
# or
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
bun test

# Verify build works
bun run build:standalone
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
1. ✅ Runs all tests (unit, integration, coverage)
2. ✅ Builds standalone binaries for 3 platforms:
   - Linux (x64, arm64)
   - macOS (x64, arm64)
   - Windows (x64)
3. ✅ Generates CHANGELOG from commits
4. ✅ Creates compressed archives (.tar.gz)
5. ✅ Generates SHA256 checksums
6. ✅ Creates GitHub Release
7. ✅ Uploads all artifacts

**5. Post-Release Verification**
```bash
# Check release on GitHub
open https://github.com/HectorZR/easy-commit/releases

# Test npm installation
npm install -g easy-commit

# Verify version
easy-commit --version
# Output: easy-commit v1.0.1 (abc123f) built on 2026-01-25_10:30:00 by github-actions
```

### Package Scripts

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "build:standalone": "bun build src/index.ts --compile --outfile easy-commit",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "lint": "biome check .",
    "lint:fix": "biome check --apply .",
    "format": "biome format --write .",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist node_modules easy-commit"
  }
}
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

GitHub Actions automatically marks these as pre-releases.

### Continuous Integration

**CI Workflow** (`.github/workflows/ci.yml`):
- Triggers on: Push to `main`, Pull Requests
- Jobs:
  - Install dependencies with Bun
  - Run linter (Biome)
  - Type checking (TypeScript)
  - Tests (with coverage)
  - Build smoke test

**Release Workflow** (`.github/workflows/release.yml`):
- Triggers on: Git tags matching `v*`
- Jobs:
  - Run full test suite
  - Build standalone binaries for all platforms
  - Create GitHub Release
  - Upload artifacts (retained for 7 days)

### Distribution Options

**1. Standalone Binary** (Recommended)
```bash
# Build
bun run build:standalone

# Produces: easy-commit (30-40 MB, no dependencies)
# Users can download and run immediately
```

**2. NPM Package**
```bash
# Install globally
npm install -g easy-commit

# Or with Bun
bun install -g easy-commit

# Requires: Bun runtime installed (~90 MB)
```

**3. From Source**
```bash
git clone https://github.com/HectorZR/easy-commit.git
cd easy-commit
bun install
bun run build:standalone
```

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
# - Build errors
# - Missing environment variables
```

**Issue: Version not showing correctly**
```bash
# Check environment variables during build
echo $VERSION $COMMIT $BUILD_DATE

# Verify version.ts is being read
bun run src/index.ts --version
```

### Release Checklist

Before creating a release tag:

- [ ] All changes merged to `main`
- [ ] Tests pass locally (`bun test`)
- [ ] Build works (`bun run build:standalone`)
- [ ] CHANGELOG.md updated (or will be auto-generated)
- [ ] Version number decided (MAJOR.MINOR.PATCH)
- [ ] Tag message prepared
- [ ] Breaking changes documented (if any)

## Migration from Go

This project was migrated from Go to TypeScript + Bun. Key differences:

### Language Changes
- Go structs → TypeScript classes/interfaces
- Goroutines/channels → Promises/async-await
- `exec.Command` → `Bun.spawn()`
- Go modules → npm/Bun packages

### Architecture Preserved
- Clean Architecture layers maintained
- Domain logic identical
- Repository pattern unchanged
- Same commit types and validation rules

### Performance Trade-offs
- Binary size: 5.6 MB (Go) → 30-40 MB (Bun standalone)
- Startup: ~5ms (Go) → ~20ms (Bun)
- Memory: ~8 MB (Go) → ~50 MB (Bun)
- **Development speed significantly improved**

See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for complete migration guide.

## Questions?

When implementing new features:
1. Determine which layer the change belongs to (Domain/Application/Infrastructure)
2. Start from the domain layer and work outward
3. Keep business logic in application layer, not infrastructure
4. Write tests before or alongside implementation
5. Run full test suite before committing (`bun test`)
6. Use Conventional Commits for all changes
7. Create releases using semantic version tags

When debugging:
- Use `console.error()` in TUI components (stdout is used by ink)
- Enable DEBUG log level in config
- Check test coverage with `bun test --coverage`
- Use TypeScript's type checking (`bun run typecheck`)
