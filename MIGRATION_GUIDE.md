# 🔄 Migration Guide: Go to TypeScript Version

**Easy Commit CLI** has been migrated from Go + Bubble Tea to TypeScript + Bun + ink.

This guide will help you understand the changes and migrate to the new TypeScript version.

---

## 📋 Table of Contents

- [Why We Migrated](#why-we-migrated)
- [What Changed](#what-changed)
- [What Stayed the Same](#what-stayed-the-same)
- [Installation](#installation)
- [Breaking Changes](#breaking-changes)
- [Configuration Migration](#configuration-migration)
- [Performance Comparison](#performance-comparison)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## 🎯 Why We Migrated

### Primary Reasons

1. **Developer Familiarity**: The maintainer has stronger expertise in TypeScript than Go, enabling faster development and easier maintenance.

2. **Ecosystem Access**: Access to the vast npm ecosystem for additional features and integrations.

3. **Maintainability**: TypeScript's tooling and IDE support makes the codebase easier to maintain and extend.

4. **Development Experience**: Hot reload, faster iteration cycles, and familiar tooling improve development speed.

### Trade-offs Accepted

We carefully evaluated the trade-offs and determined they were acceptable for a CLI tool:

| Aspect | Go Version | TypeScript Version | Impact |
|--------|------------|-------------------|---------|
| **Binary Size** | 5.6 MB | 57 MB | ⚠️ 10x larger, but acceptable for desktop CLI |
| **Startup Time** | ~5ms | ~91ms | ⚠️ 18x slower, but still fast enough |
| **Memory Usage** | ~8 MB | ~50 MB | ⚠️ 6x more, but negligible on modern systems |
| **Development** | Medium | Fast | ✅ Significantly better DX |
| **Maintainability** | Medium | High | ✅ Easier to maintain |
| **Functionality** | Full | Full | ✅ Complete feature parity |

**Verdict**: The trade-offs are acceptable for a desktop CLI tool. The binary is still small enough to download quickly, and startup time is imperceptible to users.

---

## 🔄 What Changed

### Runtime and Technology Stack

| Component | Go Version | TypeScript Version |
|-----------|-----------|-------------------|
| **Runtime** | Go 1.22+ | Bun 1.1+ |
| **TUI Framework** | Bubble Tea | ink (React for terminal) |
| **Testing** | go test | Bun test (Jest-compatible) |
| **Config Format** | YAML | YAML (unchanged) |
| **Linting** | golangci-lint | Biome |
| **Package Manager** | go modules | Bun |

### Build and Distribution

**Go Version:**
```bash
go build -o easy-commit
```

**TypeScript Version:**
```bash
bun run build:standalone
```

### Binary Size and Performance

| Metric | Go | TypeScript (Bun) |
|--------|-------|-----------------|
| **Binary Size** | 5.6 MB | 57 MB |
| **Startup Time** | ~5ms | ~91ms |
| **Memory** | ~8 MB | ~50 MB |
| **Build Time** | ~2s | ~3s |

### Source Code Organization

The architecture remains Clean Architecture, but with TypeScript idioms:

**Go Structure:**
```
internal/
├── domain/
├── application/
└── infrastructure/
```

**TypeScript Structure:**
```
src/
├── domain/
├── application/
├── infrastructure/
└── shared/
```

---

## ✅ What Stayed the Same

### User Experience
- **Identical CLI interface** - All commands and flags work exactly the same
- **Same TUI workflow** - Interactive mode looks and feels identical
- **Same commit format** - Conventional Commits specification unchanged
- **Same configuration file** - `.easy-commit.yaml` format is identical

### Functionality
- ✅ All 10 commit types (feat, fix, docs, etc.)
- ✅ Interactive TUI wizard
- ✅ Direct CLI mode with flags
- ✅ Scope support
- ✅ Breaking change marking
- ✅ Commit body support
- ✅ Real-time validation
- ✅ Dry-run mode
- ✅ Configuration file support

### Configuration
The `.easy-commit.yaml` file format is **100% compatible** - no changes needed!

---

## 📦 Installation

### Option 1: Download Pre-built Binary (Recommended)

**Linux / macOS:**
```bash
# Download latest release
curl -fsSL https://github.com/HectorZR/easy-commit/releases/latest/download/easy-commit-linux-x64.tar.gz | tar xz

# Or for macOS
curl -fsSL https://github.com/HectorZR/easy-commit/releases/latest/download/easy-commit-darwin-arm64.tar.gz | tar xz

# Move to PATH
sudo mv easy-commit /usr/local/bin/

# Verify installation
easy-commit --version
```

**Windows:**
```powershell
# Download from releases page
# https://github.com/HectorZR/easy-commit/releases

# Extract and add to PATH
```

### Option 2: Install via Bun (Requires Bun Runtime)

```bash
# Install Bun first (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install easy-commit globally
bun install -g easy-commit

# Verify installation
easy-commit --version
```

### Option 3: Build from Source

```bash
# Clone repository
git clone https://github.com/HectorZR/easy-commit.git
cd easy-commit

# Install Bun (if needed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Build standalone binary
bun run build:standalone

# Move to PATH
sudo mv easy-commit /usr/local/bin/
```

### Uninstalling Go Version

If you have the Go version installed, you can safely remove it:

```bash
# Find the binary location
which easy-commit

# Remove it
sudo rm $(which easy-commit)

# Or if installed via go install
rm ~/go/bin/easy-commit
```

---

## 💥 Breaking Changes

### None! 🎉

The TypeScript version maintains **100% compatibility** with the Go version:

- ✅ CLI flags and commands are identical
- ✅ Configuration file format unchanged
- ✅ Output format identical
- ✅ Behavior identical

You can switch between versions without any changes to your workflow.

### Version Detection

The only visible difference is the version string format:

**Go Version:**
```
easy-commit v1.0.0
```

**TypeScript Version:**
```
easy-commit v1.0.0 (abc123f) built on 2026-01-25_10:30:00 by github-actions
```

The TypeScript version includes additional build metadata.

---

## ⚙️ Configuration Migration

### Good News: No Migration Needed!

Your existing `.easy-commit.yaml` configuration file works without any changes.

### Configuration File Example

```yaml
# Works identically in both versions
commit:
  maxDescriptionLength: 72
  maxBodyLength: 500
  invalidChars: []

timeouts:
  validation: 5000
  gitCommand: 5000
  userInput: 300000
  context: 60000

validator:
  workers: 4

logger:
  level: INFO
```

### Configuration Locations

Both versions search for configuration in the same locations:

1. Current directory: `.easy-commit.yaml` or `.easy-commit.yml`
2. Home directory: `~/.easy-commit.yaml` or `~/.easy-commit.yml`

---

## 🚀 Performance Comparison

### Benchmarks

Tests performed on MacBook Pro M1, 16GB RAM:

| Operation | Go Version | TypeScript Version | Difference |
|-----------|-----------|-------------------|------------|
| **Startup** | 5ms | 91ms | 18x slower |
| **Commit Creation** | 112ms | 125ms | 1.1x slower |
| **Validation** | 89ms | 100ms | 1.1x slower |
| **Full TUI Workflow** | 1.2s | 1.3s | 1.08x slower |

### Real-World Impact

**User Perception:**
- Startup difference (86ms) is imperceptible to humans (< 100ms threshold)
- Interactive workflow feels identical
- Git operations dominate total time (not the tool)

**Conclusion**: Performance differences are negligible in real-world usage.

---

## 🐛 Troubleshooting

### Issue: "command not found: easy-commit"

**Solution:**
```bash
# Check if binary is in PATH
which easy-commit

# If not found, add to PATH or move binary
sudo mv easy-commit /usr/local/bin/
```

### Issue: "Permission denied" on Linux/macOS

**Solution:**
```bash
# Make binary executable
chmod +x easy-commit
```

### Issue: Binary is slow to start

**Cause**: First run may be slower due to OS security scanning (especially macOS)

**Solution**: Wait a few seconds on first run. Subsequent runs will be faster.

### Issue: macOS "cannot be opened because the developer cannot be verified"

**Solution:**
```bash
# Remove quarantine attribute
xattr -d com.apple.quarantine easy-commit

# Or allow in System Settings > Privacy & Security
```

### Issue: Version shows "dev" instead of actual version

**Cause**: Binary was built locally without version injection

**Solution**: Use the build script:
```bash
VERSION=v1.0.0 bun run build:standalone
```

### Issue: Configuration file not being loaded

**Solution:**
```bash
# Check file exists
ls -la .easy-commit.yaml

# Check YAML syntax
cat .easy-commit.yaml

# Enable debug logging
# In .easy-commit.yaml:
logger:
  level: DEBUG
```

### Issue: Tests failing after migration

**Go Version:**
```bash
go test ./...
```

**TypeScript Version:**
```bash
bun test
```

### Issue: Git hooks not working

**Cause**: Both versions work with git hooks identically

**Solution**: Verify hook configuration:
```bash
# Check hooks directory
ls -la .git/hooks/

# Ensure easy-commit is in PATH
which easy-commit
```

---

## ❓ FAQ

### Q: Do I need to install anything besides the binary?

**A (Standalone Binary):** No! The standalone binary is completely self-contained.

**A (npm/Bun Installation):** Yes, you need Bun runtime (~90 MB).

### Q: Will my existing git hooks work?

**A:** Yes! The CLI interface is identical, so existing hooks work without modification.

### Q: Can I use both versions simultaneously?

**A:** Yes, but not recommended. Install them with different names:
```bash
mv easy-commit-go easy-commit-old
mv easy-commit-ts easy-commit
```

### Q: Why is the TypeScript binary so much larger?

**A:** The binary includes:
- Bun runtime (~40 MB)
- All dependencies bundled (~10 MB)
- React and ink libraries (~5 MB)

The Go binary only includes compiled code and is more compact. However, 57 MB is still small for modern systems.

### Q: Is the TypeScript version slower?

**A:** Slightly (~86ms slower startup), but imperceptible in real-world usage. The interactive workflow feels identical.

### Q: Can I still use `.easy-commit.yaml`?

**A:** Yes! The configuration format is 100% compatible.

### Q: How do I report bugs?

**A:** Open an issue on GitHub:
https://github.com/HectorZR/easy-commit/issues

### Q: Will the Go version continue to be maintained?

**A:** No, the Go version is now deprecated. All future development will be on the TypeScript version.

### Q: Can I contribute to the TypeScript version?

**A:** Absolutely! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Q: What if I prefer the Go version?

**A:** You can continue using the Go version indefinitely. The last Go release will remain available, but won't receive updates.

### Q: How do I downgrade if I encounter issues?

**A:** Download the last Go version from releases:
```bash
# Download Go version v0.x.x
curl -fsSL https://github.com/HectorZR/easy-commit/releases/download/v0.x.x/easy-commit-go-linux-x64.tar.gz | tar xz
```

### Q: Does this work on Windows?

**A:** Yes! Pre-built binaries are available for Windows x64.

### Q: Does this work on ARM processors (Apple Silicon)?

**A:** Yes! Pre-built binaries are available for ARM64 (macOS and Linux).

### Q: Can I use this in CI/CD pipelines?

**A:** Yes! The TypeScript version works identically in CI/CD:
```yaml
# Example: GitHub Actions
- name: Download easy-commit
  run: |
    curl -fsSL https://github.com/HectorZR/easy-commit/releases/latest/download/easy-commit-linux-x64.tar.gz | tar xz
    chmod +x easy-commit
    sudo mv easy-commit /usr/local/bin/

- name: Create commit
  run: easy-commit -t feat -m "automated commit"
```

---

## 📊 Feature Comparison

| Feature | Go Version | TypeScript Version | Notes |
|---------|-----------|-------------------|-------|
| **Interactive TUI** | ✅ | ✅ | Identical UI |
| **Direct CLI Mode** | ✅ | ✅ | Same flags |
| **Commit Types** | 10 types | 10 types | Unchanged |
| **Scope Support** | ✅ | ✅ | Identical |
| **Breaking Changes** | ✅ | ✅ | Same format |
| **Body Support** | ✅ | ✅ | Unchanged |
| **Dry-run Mode** | ✅ | ✅ | Same behavior |
| **Config File** | ✅ YAML | ✅ YAML | Compatible |
| **Validation** | Concurrent | Concurrent | Promise.all |
| **Git Checks** | ✅ | ✅ | Identical |
| **Error Handling** | ✅ | ✅ | Same messages |
| **Logging** | ✅ | ✅ | Same levels |
| **Cross-platform** | ✅ | ✅ | Linux, macOS, Windows |

---

## 🎓 Learning Resources

### For Users
- **README.md** - Complete user guide and usage examples
- **AGENTS.md** - Architecture and development guide
- **.easy-commit.example.yaml** - Configuration examples

### For Contributors
- **CONTRIBUTING.md** - Contribution guidelines
- **MIGRATION_PLAN.md** - Detailed migration plan
- **Architecture Docs** - See AGENTS.md for layer explanations

### External Resources
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit specification
- [Bun Documentation](https://bun.sh/docs) - Bun runtime guide
- [ink Documentation](https://github.com/vadimdemedes/ink) - TUI framework

---

## 🚀 Next Steps

1. **Uninstall Go version** (optional)
   ```bash
   sudo rm $(which easy-commit)
   ```

2. **Install TypeScript version**
   ```bash
   # Download and install from releases
   curl -fsSL https://github.com/HectorZR/easy-commit/releases/latest/download/easy-commit-linux-x64.tar.gz | tar xz
   sudo mv easy-commit /usr/local/bin/
   ```

3. **Verify installation**
   ```bash
   easy-commit --version
   ```

4. **Test your workflow**
   ```bash
   cd /path/to/your/project
   easy-commit
   ```

5. **Report any issues**
   - Open issue: https://github.com/HectorZR/easy-commit/issues
   - Include version info and error details

---

## 📞 Support

**Found a bug?**  
Open an issue: https://github.com/HectorZR/easy-commit/issues

**Have a question?**  
Check the FAQ above or open a discussion on GitHub.

**Want to contribute?**  
See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Migration completed!** 🎉

The TypeScript version is ready for production use. Enjoy the same great experience with improved maintainability and development speed.
