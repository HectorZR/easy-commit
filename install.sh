#!/bin/sh
# Easy Commit Installer Script
# Install or update easy-commit CLI tool
# Usage: curl -sSL https://raw.githubusercontent.com/HectorZR/easy-commit/main/install.sh | sh

set -e

# =============================================================================
# Configuration
# =============================================================================

REPO_OWNER="HectorZR"
REPO_NAME="easy-commit"
BINARY_NAME="easy-commit"

# GitHub URLs
GITHUB_API="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}"
GITHUB_RELEASES="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag"

# Colors for output
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  MAGENTA='\033[0;35m'
  CYAN='\033[0;36m'
  NC='\033[0m' # No Color
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  MAGENTA=''
  CYAN=''
  NC=''
fi

# =============================================================================
# Utility Functions
# =============================================================================

info() {
  printf "${BLUE}ℹ${NC} %s\n" "$1"
}

success() {
  printf "${GREEN}✓${NC} %s\n" "$1"
}

warning() {
  printf "${YELLOW}⚠${NC} %s\n" "$1"
}

error() {
  printf "${RED}✗${NC} %s\n" "$1" >&2
}

fatal() {
  error "$1"
  exit 1
}

# =============================================================================
# Dependency Checks
# =============================================================================

check_dependencies() {
  info "Checking dependencies..."

  # Check for curl or wget
  if command -v curl >/dev/null 2>&1; then
    DOWNLOAD_CMD="curl"
  elif command -v wget >/dev/null 2>&1; then
    DOWNLOAD_CMD="wget"
  else
    fatal "Neither curl nor wget found. Please install one of them."
  fi

  # Check for tar (Linux/macOS)
  if [ "$OS" != "windows" ]; then
    if ! command -v tar >/dev/null 2>&1; then
      fatal "tar not found. Please install tar."
    fi
  fi

  # Check for unzip (Windows)
  if [ "$OS" = "windows" ]; then
    if ! command -v unzip >/dev/null 2>&1; then
      fatal "unzip not found. Please install unzip."
    fi
  fi

  success "All dependencies found"
}

# =============================================================================
# Platform Detection
# =============================================================================

detect_platform() {
  info "Detecting platform..."

  # Detect OS
  OS_TYPE=$(uname -s | tr '[:upper:]' '[:lower:]')
  case "$OS_TYPE" in
    linux*)
      OS="linux"
      ;;
    darwin*)
      OS="darwin"
      ;;
    mingw* | msys* | cygwin*)
      OS="windows"
      ;;
    *)
      fatal "Unsupported operating system: $OS_TYPE"
      ;;
  esac

  # Detect architecture
  ARCH_TYPE=$(uname -m)
  case "$ARCH_TYPE" in
    x86_64 | amd64)
      ARCH="x64"
      LEGACY_ARCH="amd64"
      ;;
    aarch64 | arm64)
      ARCH="arm64"
      LEGACY_ARCH="arm64"
      ;;
    *)
      fatal "Unsupported architecture: $ARCH_TYPE"
      ;;
  esac

  # Windows doesn't support arm64 in our releases
  if [ "$OS" = "windows" ] && [ "$ARCH" = "arm64" ]; then
    fatal "Windows ARM64 is not supported"
  fi

  success "Detected platform: ${OS}/${ARCH}"
}

# =============================================================================
# Version Management
# =============================================================================

get_latest_version() {
  info "Fetching latest version from GitHub..."

  if [ -n "$VERSION" ]; then
    # User specified version
    LATEST_VERSION="$VERSION"
    info "Using specified version: $LATEST_VERSION"
    return
  fi

  # Query GitHub API
  if [ "$DOWNLOAD_CMD" = "curl" ]; then
    RELEASE_DATA=$(curl -sS "${GITHUB_API}/releases/latest")
  else
    RELEASE_DATA=$(wget -qO- "${GITHUB_API}/releases/latest")
  fi

  # Parse tag_name from JSON (simple grep/sed approach for POSIX compatibility)
  LATEST_VERSION=$(echo "$RELEASE_DATA" | grep '"tag_name":' | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')

  if [ -z "$LATEST_VERSION" ]; then
    fatal "Failed to fetch latest version. You can specify a version manually: VERSION=v1.0.0 $0"
  fi

  success "Latest version: $LATEST_VERSION"
}

get_installed_version() {
  if command -v "$BINARY_NAME" >/dev/null 2>&1; then
    # Extract version from 'easy-commit --version' output
    # Expected format: "easy-commit v1.0.0 (abc123) built on ..."
    INSTALLED_VERSION=$("$BINARY_NAME" --version 2>/dev/null | awk '{print $2}' || echo "")
    if [ -n "$INSTALLED_VERSION" ]; then
      echo "$INSTALLED_VERSION"
    fi
  fi
}

check_if_update_needed() {
  CURRENT=$(get_installed_version)

  if [ -n "$CURRENT" ]; then
    info "Current version: $CURRENT"

    if [ "$CURRENT" = "$LATEST_VERSION" ]; then
      success "Already up to date ($CURRENT)"
      if [ -z "$FORCE" ]; then
        exit 0
      else
        warning "FORCE=1 set, reinstalling anyway..."
      fi
    else
      info "Update available: $CURRENT → $LATEST_VERSION"
    fi
  else
    info "No existing installation found"
  fi
}

# =============================================================================
# Download and Verification
# =============================================================================

download_file() {
  local url="$1"
  local output="$2"
  local description="$3"

  info "Downloading $description..."

  if [ "$DOWNLOAD_CMD" = "curl" ]; then
    if [ -n "$VERBOSE" ]; then
      curl -fL --progress-bar -o "$output" "$url"
    else
      curl -fsL -o "$output" "$url"
    fi
  else
    if [ -n "$VERBOSE" ]; then
      wget --show-progress -O "$output" "$url"
    else
      wget -q -O "$output" "$url"
    fi
  fi

  if [ ! -f "$output" ] || [ ! -s "$output" ]; then
    # Clean up empty files
    rm -f "$output"
    return 1
  fi
  return 0
}

verify_checksum() {
  if [ -n "$SKIP_VERIFY" ]; then
    warning "Checksum verification skipped (SKIP_VERIFY=1)"
    return
  fi

  info "Verifying checksum..."

  # Determine which sha256 tool is available
  if command -v sha256sum >/dev/null 2>&1; then
    SHA_CMD="sha256sum"
  elif command -v shasum >/dev/null 2>&1; then
    SHA_CMD="shasum -a 256"
  else
    warning "Neither sha256sum nor shasum found. Skipping checksum verification."
    warning "Set SKIP_VERIFY=1 to suppress this warning."
    return
  fi

  local expected_checksum=""

  if [ "$NAMING_CONVENTION" = "new" ]; then
    # New convention: individual .sha256 files
    local checksum_filename="${ARCHIVE_NAME}.sha256"
    local checksum_url="${GITHUB_RELEASES}/${LATEST_VERSION}/${checksum_filename}"

    if download_file "$checksum_url" "$TEMP_DIR/$checksum_filename" "checksum file"; then
      expected_checksum=$(cat "$TEMP_DIR/$checksum_filename" | awk '{print $1}')
    else
      warning "Could not download checksum file. Skipping verification."
      return
    fi

  else
    # Legacy convention: single checksums.txt file
    local checksum_filename="${BINARY_NAME}_${LATEST_VERSION#v}_checksums.txt"
    local checksum_url="${GITHUB_RELEASES}/${LATEST_VERSION}/${checksum_filename}"

    if download_file "$checksum_url" "$TEMP_DIR/checksums.txt" "checksums list"; then
        local archive_basename=$(basename "$ARCHIVE_FILE")
        expected_checksum=$(grep "$archive_basename" "$TEMP_DIR/checksums.txt" | awk '{print $1}')
    else
        # Try fallback name: checksums.txt
        local fallback_url="${GITHUB_RELEASES}/${LATEST_VERSION}/checksums.txt"
        if download_file "$fallback_url" "$TEMP_DIR/checksums.txt" "checksums list"; then
            local archive_basename=$(basename "$ARCHIVE_FILE")
            expected_checksum=$(grep "$archive_basename" "$TEMP_DIR/checksums.txt" | awk '{print $1}')
        else
            warning "Could not download checksums list. Skipping verification."
            return
        fi
    fi
  fi

  if [ -z "$expected_checksum" ]; then
    warning "Checksum not found for $ARCHIVE_NAME. Skipping verification."
    return
  fi

  # Calculate actual checksum
  cd "$TEMP_DIR"
  local actual_checksum=$($SHA_CMD "$ARCHIVE_NAME" | awk '{print $1}')
  cd - >/dev/null

  if [ "$expected_checksum" != "$actual_checksum" ]; then
    fatal "Checksum verification failed!\nExpected: $expected_checksum\nActual:   $actual_checksum"
  fi

  success "Checksum verified successfully"
}

# =============================================================================
# Installation
# =============================================================================

download_release() {
  local version_no_v="${LATEST_VERSION#v}"

  if [ "$OS" = "windows" ]; then
    ARCHIVE_EXT="zip"
  else
    ARCHIVE_EXT="tar.gz"
  fi

  # Try NEW naming convention (easy-commit-linux-x64.tar.gz)
  local NEW_NAME="${BINARY_NAME}-${OS}-${ARCH}.${ARCHIVE_EXT}"
  local NEW_URL="${GITHUB_RELEASES}/${LATEST_VERSION}/${NEW_NAME}"

  info "Attempting download with new naming convention..."
  if download_file "$NEW_URL" "$TEMP_DIR/$NEW_NAME" "$NEW_NAME"; then
      ARCHIVE_NAME="$NEW_NAME"
      NAMING_CONVENTION="new"
      success "Downloaded release archive (new convention)"
      return
  fi

  # Try LEGACY naming convention (easy-commit_v1.0.0_linux_amd64.tar.gz)
  local LEGACY_NAME="${BINARY_NAME}_${version_no_v}_${OS}_${LEGACY_ARCH}.${ARCHIVE_EXT}"
  local LEGACY_URL="${GITHUB_RELEASES}/${LATEST_VERSION}/${LEGACY_NAME}"

  info "New convention failed, trying legacy naming convention..."
  if download_file "$LEGACY_URL" "$TEMP_DIR/$LEGACY_NAME" "$LEGACY_NAME"; then
      ARCHIVE_NAME="$LEGACY_NAME"
      NAMING_CONVENTION="legacy"
      success "Downloaded release archive (legacy convention)"
      return
  fi

  fatal "Failed to download release archive. Tried:\n  - $NEW_URL\n  - $LEGACY_URL"
}

extract_archive() {
  info "Extracting archive..."

  cd "$TEMP_DIR"

  if [ "$OS" = "windows" ]; then
    unzip -q "$ARCHIVE_NAME"
  else
    tar -xzf "$ARCHIVE_NAME"
  fi

  # The binary inside the archive usually has the platform suffix (e.g., easy-commit-linux-x64)
  # We need to find it and normalize it

  if [ "$OS" = "windows" ]; then
    # On Windows, look for .exe files
    # It might be named easy-commit-windows-x64.exe
    if [ -f "${BINARY_NAME}-${OS}-${ARCH}.exe" ]; then
        mv "${BINARY_NAME}-${OS}-${ARCH}.exe" "${BINARY_NAME}.exe"
    elif [ -f "${BINARY_NAME}.exe" ]; then
        # It's already named correctly
        :
    else
        # Try to find any exe that looks like our binary
        FOUND_EXE=$(find . -name "${BINARY_NAME}*.exe" | head -n 1)
        if [ -n "$FOUND_EXE" ]; then
            mv "$FOUND_EXE" "${BINARY_NAME}.exe"
        fi
    fi
    BINARY_PATH="$TEMP_DIR/${BINARY_NAME}.exe"
  else
    # On Unix, look for the binary
    # It might be named easy-commit-linux-x64
    if [ -f "${BINARY_NAME}-${OS}-${ARCH}" ]; then
        mv "${BINARY_NAME}-${OS}-${ARCH}" "${BINARY_NAME}"
    elif [ -f "${BINARY_NAME}" ]; then
        # It's already named correctly
        :
    else
        # Try to find any executable that looks like our binary (excluding the archive itself)
        # We look for files with execute permission or just the name pattern
        FOUND_BIN=$(find . -type f ! -name "*.${ARCHIVE_EXT}" ! -name "*.sha256" -name "${BINARY_NAME}*" | head -n 1)
        if [ -n "$FOUND_BIN" ]; then
            mv "$FOUND_BIN" "${BINARY_NAME}"
        fi
    fi
    BINARY_PATH="$TEMP_DIR/${BINARY_NAME}"
  fi

  if [ ! -f "$BINARY_PATH" ]; then
    fatal "Binary not found after extraction: $BINARY_PATH"
  fi

  # Make binary executable
  chmod +x "$BINARY_PATH"

  success "Extracted successfully"
  cd - >/dev/null
}

determine_install_dir() {
  if [ -n "$INSTALL_DIR" ]; then
    # User specified custom directory
    TARGET_DIR="$INSTALL_DIR"
    info "Using custom installation directory: $TARGET_DIR"
    return
  fi

  # Try /usr/local/bin first (standard location)
  if [ -w "/usr/local/bin" ] || [ -w "/usr/local" ]; then
    TARGET_DIR="/usr/local/bin"
  else
    # Fallback to user's local bin
    TARGET_DIR="$HOME/.local/bin"

    # Create directory if it doesn't exist
    if [ ! -d "$TARGET_DIR" ]; then
      mkdir -p "$TARGET_DIR"
      info "Created directory: $TARGET_DIR"
    fi

    warning "Cannot write to /usr/local/bin (permission denied)"
    info "Installing to user directory: $TARGET_DIR"

    # Check if directory is in PATH
    case ":$PATH:" in
      *":$TARGET_DIR:"*)
        # Already in PATH
        ;;
      *)
        ADD_TO_PATH=1
        ;;
    esac
  fi
}

install_binary() {
  determine_install_dir

  TARGET_PATH="$TARGET_DIR/$BINARY_NAME"
  if [ "$OS" = "windows" ]; then
    TARGET_PATH="${TARGET_PATH}.exe"
  fi

  info "Installing to: $TARGET_PATH"

  # Copy binary
  if ! cp "$BINARY_PATH" "$TARGET_PATH" 2>/dev/null; then
    # If copy fails, try with sudo
    warning "Permission denied, attempting with sudo..."
    if ! sudo cp "$BINARY_PATH" "$TARGET_PATH"; then
      fatal "Failed to install binary. Try running with sudo or set INSTALL_DIR to a writable location."
    fi
  fi

  # Ensure it's executable
  chmod +x "$TARGET_PATH" 2>/dev/null || sudo chmod +x "$TARGET_PATH"

  success "Binary installed successfully"
}

verify_installation() {
  info "Verifying installation..."

  # If custom INSTALL_DIR is set, verify the binary at that location
  if [ -n "$INSTALL_DIR" ]; then
    if [ -f "$TARGET_PATH" ] && [ -x "$TARGET_PATH" ]; then
      INSTALLED=$("$TARGET_PATH" --version 2>/dev/null | head -n 1)
      if [ -n "$INSTALLED" ]; then
        success "Installation verified: $INSTALLED"
        return
      fi
    fi
    fatal "Installation verification failed. Binary not found at $TARGET_PATH"
  fi

  # Otherwise, check if binary is in PATH
  if ! command -v "$BINARY_NAME" >/dev/null 2>&1; then
    if [ -n "$ADD_TO_PATH" ]; then
      warning "$BINARY_NAME not found in PATH (will be available after adding to PATH)"
      # Verify the binary exists and works at the installation location
      if [ -f "$TARGET_PATH" ] && [ -x "$TARGET_PATH" ]; then
        INSTALLED=$("$TARGET_PATH" --version 2>/dev/null | head -n 1)
        if [ -n "$INSTALLED" ]; then
          success "Binary installed: $INSTALLED"
          return
        fi
      fi
      fatal "Installation verification failed. Binary exists but cannot execute."
    fi
    fatal "Installation verification failed. Binary not found in PATH."
  fi

  # Run version check
  INSTALLED=$("$BINARY_NAME" --version 2>/dev/null | head -n 1)

  if [ -z "$INSTALLED" ]; then
    fatal "Installation verification failed. Could not run $BINARY_NAME --version"
  fi

  success "Installation verified: $INSTALLED"
}

# =============================================================================
# Cleanup
# =============================================================================

cleanup() {
  if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
  fi
}

# =============================================================================
# Main Installation Flow
# =============================================================================

print_banner() {
  echo ""
  echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "${CYAN}  Easy Commit Installer${NC}"
  echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

print_success_message() {
  echo ""
  echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "${GREEN}  ✓ ${BINARY_NAME} ${LATEST_VERSION} installed!${NC}"
  echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "Installation location: ${MAGENTA}$TARGET_PATH${NC}"
  echo ""

  if [ -n "$ADD_TO_PATH" ]; then
    echo "${YELLOW}⚠ Action required:${NC} Add to your PATH"
    echo ""
    echo "Run this command:"
    echo "  ${CYAN}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
    echo ""
    echo "To make it permanent, add to your shell config:"

    if [ -f "$HOME/.bashrc" ]; then
      echo "  ${CYAN}echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc${NC}"
    elif [ -f "$HOME/.zshrc" ]; then
      echo "  ${CYAN}echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.zshrc${NC}"
    else
      echo "  ${CYAN}echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.profile${NC}"
    fi
    echo ""
  else
    echo "Try it now:"
    echo "  ${CYAN}${BINARY_NAME} --version${NC}"
    echo "  ${CYAN}${BINARY_NAME}${NC}"
    echo ""
  fi

  echo "Documentation:"
  echo "  ${BLUE}https://github.com/${REPO_OWNER}/${REPO_NAME}${NC}"
  echo ""
}

main() {
  # Parse arguments
  for arg in "$@"; do
    case "$arg" in
      --skip-verify)
        SKIP_VERIFY=1
        ;;
      --verbose)
        VERBOSE=1
        ;;
      --help)
        echo "Easy Commit Installer"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --skip-verify    Skip SHA256 checksum verification"
        echo "  --verbose        Show detailed output"
        echo "  --help           Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  VERSION          Specify version to install (e.g., v1.0.0)"
        echo "  INSTALL_DIR      Custom installation directory"
        echo "  FORCE            Force reinstall even if up to date"
        echo "  SKIP_VERIFY      Skip checksum verification (same as --skip-verify)"
        echo ""
        echo "Examples:"
        echo "  $0"
        echo "  VERSION=v1.0.0 $0"
        echo "  INSTALL_DIR=/opt/bin $0"
        echo "  FORCE=1 $0"
        exit 0
        ;;
    esac
  done

  print_banner

  # Create temporary directory
  TEMP_DIR=$(mktemp -d)
  trap cleanup EXIT

  # Installation steps
  detect_platform
  check_dependencies
  get_latest_version
  check_if_update_needed
  download_release
  verify_checksum
  extract_archive
  install_binary
  verify_installation

  print_success_message
}

# Run main function
main "$@"
