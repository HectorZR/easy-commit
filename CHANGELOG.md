# easy-commit

## 2.0.2

### Patch Changes

- ea51787: fix: explicit artifact upload patterns

## 2.0.1

### Patch Changes

- 8bbc441: fix: update install script for compatibility with new release artifacts

## 2.0.0

### Major Changes

- ccfab32: Refactor complete: Migration from Go to TypeScript + Bun.

  This major release marks a complete rewrite of the application. We decided to migrate for several reasons:

  - **TypeScript**: We prioritized the developer experience and comfort of using TypeScript's strong typing system.
  - **Bun**: We wanted to test and verify Bun's capabilities as an all-in-one toolchain.
  - **Results**: The experiment confirmed that Bun delivers excellent performance and stability for CLI applications, justifying the switch.
