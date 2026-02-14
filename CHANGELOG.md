# easy-commit

## 2.1.1

### Patch Changes

- 2d04ab0: fix: scope length warning

## 2.1.0

### Minor Changes

- 0639bc2: feat: add MCP server capabilities

## 2.0.5

### Patch Changes

- 6261083: refactor(cli): adjust version display

## 2.0.4

### Patch Changes

- 8019945: fix: release action

## 2.0.3

### Patch Changes

- bbc81d1: fix: flatten artifact download structure for release

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
