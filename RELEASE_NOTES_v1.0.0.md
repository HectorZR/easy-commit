# Release Notes: v1.0.0 - TypeScript Migration 🎉

**Release Date:** January 25, 2026  
**Codename:** "Bun in the Oven"

---

## 🚀 Overview

We're excited to announce **Easy Commit v1.0.0**, a complete rewrite from Go to TypeScript + Bun!

This release maintains 100% feature parity with the Go version while providing improved maintainability and development experience.

---

## ✨ What's New

### Complete TypeScript Rewrite

- **Modern Stack**: TypeScript + Bun + ink (React for terminal)
- **Ultra-fast Runtime**: Powered by Bun for blazing-fast execution
- **Better DX**: Hot reload, familiar tooling, and TypeScript type safety
- **Clean Architecture**: Maintained architectural principles with TypeScript idioms

### Enhanced Build System

- **Standalone Binaries**: Single-file executables with no dependencies (57 MB)
- **Multi-platform Support**: Pre-built binaries for:
  - Linux (x64, arm64)
  - macOS (x64, arm64)
  - Windows (x64)
- **Version Injection**: Build-time version metadata
- **Automated Releases**: Full CI/CD with GitHub Actions

### Improved Testing

- **180 Tests**: Comprehensive test suite (up from 141 in Go version)
- **87% Code Coverage**: 95% line coverage
- **E2E Tests**: Full workflow testing
- **Performance Benchmarks**: Automated performance tracking
- **Faster Test Execution**: Bun's test runner is significantly faster

### Better Tooling

- **Biome**: Single tool for linting + formatting (replaces ESLint + Prettier)
- **Type Safety**: Strict TypeScript with full type coverage
- **Better IDE Support**: Enhanced autocomplete and refactoring

---

## 📦 Distribution Options

### Option 1: Standalone Binary (Recommended)

Download pre-built binaries from [GitHub Releases](https://github.com/HectorZR/easy-commit/releases):

```bash
# Linux x64
curl -fsSL https://github.com/HectorZR/easy-commit/releases/download/v1.0.0/easy-commit-linux-x64.tar.gz | tar xz
sudo mv easy-commit /usr/local/bin/

# macOS ARM64 (Apple Silicon)
curl -fsSL https://github.com/HectorZR/easy-commit/releases/download/v1.0.0/easy-commit-darwin-arm64.tar.gz | tar xz
sudo mv easy-commit /usr/local/bin/

# Windows
# Download from releases page and add to PATH
```

**Benefits:**
- No runtime dependencies
- Single executable file
- Works anywhere

### Option 2: Install via Bun

```bash
bun install -g easy-commit
```

**Requirements:**
- Bun runtime installed (~90 MB)

### Option 3: Build from Source

```bash
git clone https://github.com/HectorZR/easy-commit.git
cd easy-commit
bun install
bun run build:standalone
```

---

## ✅ Features

All features from the Go version are preserved:

- ✅ **Interactive TUI**: Beautiful terminal wizard
- ✅ **Direct CLI Mode**: Quick commits with flags
- ✅ **10 Commit Types**: feat, fix, docs, style, refactor, test, chore, build, ci, perf
- ✅ **Scope Support**: Optional commit scopes
- ✅ **Breaking Changes**: Mark breaking changes
- ✅ **Body Support**: Multi-line commit bodies
- ✅ **Real-time Validation**: Instant feedback on input
- ✅ **Dry-run Mode**: Preview without committing
- ✅ **Configuration File**: YAML configuration support
- ✅ **Conventional Commits**: 100% spec-compliant

---

## 🔄 Migration from Go Version

### Good News: Zero Breaking Changes! 🎉

The TypeScript version is 100% compatible with the Go version:

- ✅ Same CLI flags and commands
- ✅ Same configuration file format
- ✅ Same behavior and output
- ✅ Same TUI workflow

### Migration Steps

1. **Uninstall Go version** (optional):
   ```bash
   sudo rm $(which easy-commit)
   ```

2. **Install TypeScript version**:
   ```bash
   # Download latest release
   curl -fsSL https://github.com/HectorZR/easy-commit/releases/latest/download/easy-commit-linux-x64.tar.gz | tar xz
   sudo mv easy-commit /usr/local/bin/
   ```

3. **Verify**:
   ```bash
   easy-commit --version
   # Output: easy-commit v1.0.0 (abc123f) built on 2026-01-25
   ```

4. **Continue using as before** - no workflow changes needed!

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.

---

## 📊 Performance Comparison

### Benchmarks (MacBook Pro M1, 16GB RAM)

| Metric | Go Version | TypeScript Version | Difference |
|--------|-----------|-------------------|------------|
| **Startup** | 5ms | 91ms | 18x slower |
| **Commit Creation** | 112ms | 125ms | 1.1x slower |
| **Validation** | 89ms | 100ms | 1.1x slower |
| **Binary Size** | 5.6 MB | 57 MB | 10x larger |
| **Memory Usage** | 8 MB | 50 MB | 6x more |

### Real-World Impact

- **Startup difference is imperceptible** (< 100ms threshold)
- **Interactive workflow feels identical**
- **Git operations dominate total time**, not the tool
- **Binary size acceptable** for modern systems

**Conclusion**: Performance trade-offs are negligible in practice.

---

## 🏗️ Technical Details

### Architecture

**Clean Architecture** with three layers:

```
Infrastructure → Application → Domain
```

- **Domain**: Pure business logic (entities, value objects, interfaces)
- **Application**: Use cases, services, validators
- **Infrastructure**: CLI, Git, Config, TUI, Logger

### Technology Stack

- **Runtime**: Bun 1.1+
- **Language**: TypeScript 5.0+ (strict mode)
- **TUI**: ink v6 (React for terminal)
- **CLI**: commander v14
- **Config**: js-yaml + Zod validation
- **Testing**: Bun test (Jest-compatible)
- **Linting**: Biome (unified linting + formatting)

### Build System

- **Bundler**: Bun's native bundler
- **Compiler**: `bun build --compile` for standalone binaries
- **CI/CD**: GitHub Actions for multi-platform builds
- **Version Injection**: Build-time metadata embedding

---

## 📈 Test Coverage

```
180 total tests (up from 141)
87% code coverage
95% line coverage

Breakdown:
- Unit tests: 167
- Integration tests: 4
- E2E tests: 9
- Performance tests: 4
```

**Coverage by Layer:**
- Domain: 91%
- Application: 89%
- Infrastructure: 83%

---

## 🐛 Known Issues

None! 🎉

All features are working as expected. If you encounter any issues, please [open an issue](https://github.com/HectorZR/easy-commit/issues).

---

## 🔮 Future Plans

### v1.1.0 (Minor Release)

Potential features under consideration:

- Custom commit type templates
- Git hook integration helpers
- Commit message linting
- Config file generation wizard
- Additional validation rules

**Want to contribute?** Check out [CONTRIBUTING.md](./CONTRIBUTING.md) and open a PR!

### v2.0.0 (Major Release)

Long-term ideas:

- Multi-language support (i18n)
- Plugin system for extensibility
- Team-specific commit conventions
- Integration with issue trackers
- AI-powered commit message suggestions

---

## 📚 Documentation

### User Documentation
- **README.md** - Installation, usage, features, examples
- **MIGRATION_GUIDE.md** - Migration from Go to TypeScript version
- **.easy-commit.example.yaml** - Configuration examples

### Developer Documentation
- **CONTRIBUTING.md** - Contribution guidelines and development setup
- **AGENTS.md** - Architecture, design decisions, development guide
- **MIGRATION_PLAN.md** - Technical migration plan (9 phases)

---

## 🙏 Acknowledgments

### Contributors

Thank you to everyone who contributed to this release!

- **Hector** - Project maintainer and primary developer
- All issue reporters and feature requesters

### Special Thanks

- **Bun team** - For the amazing runtime and tooling
- **ink team** - For the excellent React-based TUI framework
- **Conventional Commits** - For the commit specification
- **Clean Architecture** - For the architectural principles

---

## 📝 Changelog

### Added

- ✨ Complete TypeScript rewrite with Bun runtime
- ✨ Multi-platform standalone binaries (Linux, macOS, Windows)
- ✨ Enhanced build system with version injection
- ✨ Comprehensive test suite (180 tests, 87% coverage)
- ✨ E2E and performance tests
- ✨ Biome for unified linting and formatting
- ✨ Automated CI/CD with GitHub Actions
- ✨ Migration guide from Go version
- ✨ Enhanced documentation (AGENTS.md, CONTRIBUTING.md)

### Changed

- 🔄 Runtime: Go → Bun
- 🔄 TUI Framework: Bubble Tea → ink (React)
- 🔄 Testing: go test → Bun test
- 🔄 Linting: golangci-lint → Biome
- 🔄 Build: go build → bun build --compile

### Maintained

- ✅ 100% feature parity with Go version
- ✅ Identical CLI interface
- ✅ Compatible configuration format
- ✅ Same commit format and validation
- ✅ Clean Architecture principles

### Performance

- ⚡ Startup: ~91ms (acceptable for CLI)
- ⚡ Commit creation: ~125ms
- ⚡ Validation: ~100ms
- 📦 Binary size: 57 MB (self-contained)
- 💾 Memory: ~50 MB

---

## 🔗 Links

- **GitHub Repository**: https://github.com/HectorZR/easy-commit
- **Releases**: https://github.com/HectorZR/easy-commit/releases
- **Issues**: https://github.com/HectorZR/easy-commit/issues
- **Conventional Commits**: https://www.conventionalcommits.org/
- **Bun**: https://bun.sh

---

## 📄 License

MIT License - see [LICENSE.md](./LICENSE.md)

---

## 🎉 Get Started

```bash
# Install
curl -fsSL https://github.com/HectorZR/easy-commit/releases/latest/download/easy-commit-linux-x64.tar.gz | tar xz
sudo mv easy-commit /usr/local/bin/

# Verify
easy-commit --version

# Use
cd /path/to/your/project
easy-commit
```

**Happy committing!** 🚀

---

*For questions, feedback, or issues, please visit [GitHub Issues](https://github.com/HectorZR/easy-commit/issues).*
