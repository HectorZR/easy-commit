# Easy Commit - Development Guide

## Quick Start

### Install Dependencies
```bash
bun install
```

### Development
```bash
# Run in development mode (with hot reload)
bun run dev

# Run type checking
bun run typecheck

# Run linter
bun run lint

# Fix linting issues
bunx biome check --write .

# Format code
bun run format
```

### Building

```bash
# Build to dist directory
bun run build

# Build standalone binary (30-40 MB, includes Bun runtime)
bun run build:standalone

# After standalone build, you can run:
./easy-commit
```

### Testing

```bash
# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

### Cleaning

```bash
# Clean build artifacts and dependencies
bun run clean
```

## Project Structure

```
easy-commit/
├── src/                    # TypeScript source code
│   ├── domain/            # Domain layer (business logic)
│   ├── application/       # Application layer (use cases)
│   ├── infrastructure/    # Infrastructure layer (external concerns)
│   ├── shared/            # Shared utilities
│   ├── index.ts           # Entry point
│   └── version.ts         # Version information
├── tests/                 # Test files
├── scripts/               # Build and utility scripts
├── dist/                  # Build output (gitignored)
├── node_modules/          # Dependencies (gitignored)
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── biome.json             # Biome linter/formatter configuration
└── MIGRATION_STATUS.md    # Migration progress tracker
```

## Architecture

This project follows **Clean Architecture** with three layers:

1. **Domain Layer** (`src/domain/`)
   - Pure business logic
   - No external dependencies
   - Entities, value objects, repository interfaces

2. **Application Layer** (`src/application/`)
   - Use cases and services
   - Orchestrates domain objects
   - Depends only on domain layer

3. **Infrastructure Layer** (`src/infrastructure/`)
   - External concerns (git, terminal, config, TUI)
   - Implements domain interfaces
   - Depends on application and domain layers

**Dependency Rule:** Infrastructure → Application → Domain (never reverse)

## Migration Status

Currently on **Phase 1: Setup** ✅ COMPLETED

See [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) for detailed progress.

## Development Workflow

1. Make changes to TypeScript files
2. Run `bun run typecheck` to verify types
3. Run `bun run lint` to check code style
4. Fix issues with `bunx biome check --write .`
5. Test with `bun run dev`
6. Write/run tests with `bun test`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Tools Used

- **Bun** - Ultra-fast JavaScript runtime
- **TypeScript** - Type-safe JavaScript
- **Biome** - Fast linter and formatter
- **ink** - React for terminal (TUI framework)
- **Zod** - Schema validation
- **Commander** - CLI argument parsing

## Next Steps

To continue the migration:

1. Implement Phase 2: Domain Layer (see MIGRATION_PLAN.md)
2. Write comprehensive unit tests
3. Implement infrastructure components
4. Build the TUI with ink
5. Complete integration tests

---

For detailed migration plan, see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)
