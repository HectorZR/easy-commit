# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-06

### Added
- Interactive Terminal User Interface (TUI) powered by Bubble Tea framework
- Arrow key navigation for intuitive commit type selection
- Real-time validation with character count display
- Search and filter functionality for commit types (press `/`)
- Back navigation capability with Ctrl+B to edit previous steps
- Direct CLI mode with comprehensive flag support
- Concurrent validation using worker pool pattern for performance
- Clean Architecture implementation with three-layer separation
- Comprehensive test suite including unit and integration tests
- Beautiful commit preview with styled boxes using Lipgloss
- Support for optional scope, body, and breaking change fields
- Configuration file support (`.easy-commit.yaml`)
- Dry-run mode to preview commits without creating them

### Features
- **feat(tui)!**: add Bubble Tea TUI library to improve UX/UI (d515228:main.go:18)
  - Complete rewrite of UI layer using modern TUI framework
  - Improved keyboard navigation and user experience
  - Breaking change: Removed legacy terminal input methods
- **feat(cli)**: add complete interactive CLI application (7b5feb0:cmd/easy-commit/main.go:25)
  - Flag-based commit creation
  - Interactive and direct modes
- **feat**: add validator with worker pool pattern (703985a:internal/application/validator.go:35)
  - Concurrent validation for better performance
  - Configurable worker pool size
- **feat**: add git executor (763eab9:internal/infrastructure/git/executor.go:22)
  - Safe git command execution
  - Timeout handling

### Fixed
- **fix**: quit program after commit success (d515228:cmd/easy-commit/main.go:97)
  - Program now exits cleanly after successful commit

### Refactoring
- **refactor**: add centralized configurations (496ba97:internal/config/config.go:15)
  - Moved all configuration to dedicated config package
  - Improved configuration management

### Documentation
- **docs**: add AGENTS.md file (bcd2fc6:AGENTS.md:1)
  - Comprehensive guide for AI agents and developers
  - Project structure and architecture documentation
  - Development workflow guidelines

### Chores
- Update Bubble Tea dependencies to latest versions (b6901aa)
- Add .bak files to .gitignore (fe00a47)
- Initial project setup and commit (1ce154d)

[Unreleased]: https://github.com/HectorZR/easy-commit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/HectorZR/easy-commit/releases/tag/v1.0.0
