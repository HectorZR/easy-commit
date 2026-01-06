# Makefile for easy-commit
# Variables
BINARY_NAME=easy-commit
VERSION?=dev
COMMIT?=$(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_DATE?=$(shell date -u '+%Y-%m-%d_%H:%M:%S')
BUILT_BY?=$(shell whoami)

LDFLAGS=-ldflags "\
	-X main.version=$(VERSION) \
	-X main.commit=$(COMMIT) \
	-X main.date=$(BUILD_DATE) \
	-X main.builtBy=$(BUILT_BY)"

# Directories
CMD_DIR=./cmd/easy-commit
BUILD_DIR=./dist

.PHONY: help
help: ## Show this help message
	@echo "Easy Commit - Makefile Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

.PHONY: build
build: ## Build the binary for development (version=dev)
	@echo "Building $(BINARY_NAME) (development)..."
	@go build $(LDFLAGS) -o $(BINARY_NAME) $(CMD_DIR)
	@echo "✓ Build complete: ./$(BINARY_NAME)"

.PHONY: build-release
build-release: ## Build the binary simulating a release
	@echo "Building $(BINARY_NAME) (release mode)..."
	@go build $(LDFLAGS) -o $(BINARY_NAME) $(CMD_DIR)
	@echo "✓ Build complete: ./$(BINARY_NAME)"
	@./$(BINARY_NAME) --version

.PHONY: install
install: ## Install the binary globally
	@echo "Installing $(BINARY_NAME)..."
	@go install $(LDFLAGS) $(CMD_DIR)
	@echo "✓ Installed: $(BINARY_NAME)"

.PHONY: run
run: build ## Build and run the application
	@echo "Running $(BINARY_NAME)..."
	@./$(BINARY_NAME)

.PHONY: test
test: ## Run all tests
	@echo "Running tests..."
	@go test -v ./...

.PHONY: test-race
test-race: ## Run tests with race detector
	@echo "Running tests with race detector..."
	@go test -race ./...

.PHONY: test-coverage
test-coverage: ## Run tests with coverage report
	@echo "Running tests with coverage..."
	@go test -cover -coverprofile=coverage.txt ./...
	@go tool cover -func=coverage.txt
	@echo ""
	@echo "For HTML coverage report, run:"
	@echo "  go tool cover -html=coverage.txt"

.PHONY: lint
lint: ## Run linter (requires golangci-lint)
	@echo "Running linter..."
	@if command -v golangci-lint >/dev/null 2>&1; then \
		golangci-lint run ./...; \
	else \
		echo "golangci-lint not installed. Install with:"; \
		echo "  brew install golangci-lint"; \
		echo "  or: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; \
		exit 1; \
	fi

.PHONY: clean
clean: ## Remove build artifacts
	@echo "Cleaning build artifacts..."
	@rm -f $(BINARY_NAME)
	@rm -f coverage.txt
	@rm -rf $(BUILD_DIR)
	@echo "✓ Clean complete"

.PHONY: deps
deps: ## Download Go module dependencies
	@echo "Downloading dependencies..."
	@go mod download
	@go mod tidy
	@echo "✓ Dependencies updated"

.PHONY: goreleaser-check
goreleaser-check: ## Validate GoReleaser configuration
	@echo "Validating GoReleaser config..."
	@if command -v goreleaser >/dev/null 2>&1; then \
		goreleaser check; \
	else \
		echo "goreleaser not installed. Install with:"; \
		echo "  brew install goreleaser/tap/goreleaser"; \
		echo "  or: go install github.com/goreleaser/goreleaser@latest"; \
		exit 1; \
	fi

.PHONY: goreleaser-snapshot
goreleaser-snapshot: ## Build snapshot release locally (for testing)
	@echo "Building snapshot release..."
	@if command -v goreleaser >/dev/null 2>&1; then \
		goreleaser release --snapshot --skip=publish --clean; \
		@echo "✓ Snapshot built in dist/"; \
	else \
		echo "goreleaser not installed. Install with:"; \
		echo "  brew install goreleaser/tap/goreleaser"; \
		exit 1; \
	fi

.PHONY: all
all: clean deps test build ## Run clean, deps, test, and build

# Default target
.DEFAULT_GOAL := help
