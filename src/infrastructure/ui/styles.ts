import chalk from 'chalk';

/**
 * Color palette for the TUI
 */
export const colors = {
  primary: chalk.bold.magentaBright,
  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
  muted: chalk.gray,
  highlight: chalk.bold.white,
  dim: chalk.dim,
};

/**
 * Styled text utilities
 */
export const text = {
  title: (str: string) => chalk.bold.magentaBright(str),
  subtitle: (str: string) => chalk.gray(str),
  success: (str: string) => chalk.green(`✓ ${str}`),
  error: (str: string) => chalk.red(`✗ ${str}`),
  warning: (str: string) => chalk.yellow(`⚠ ${str}`),
  info: (str: string) => chalk.blue(`ℹ ${str}`),
  label: (str: string) => chalk.bold(str),
  value: (str: string) => chalk.magentaBright(str),
  hint: (str: string) => chalk.dim(str),
  selected: (str: string) => chalk.bold.magentaBright(`❯ ${str}`),
  unselected: (str: string) => `  ${str}`,
};

/**
 * Box styles for ink-box component
 */
export const boxStyles = {
  default: {
    padding: 1,
    borderStyle: 'round' as const,
    borderColor: 'cyan',
  },
  success: {
    padding: 1,
    borderStyle: 'round' as const,
    borderColor: 'green',
  },
  error: {
    padding: 1,
    borderStyle: 'round' as const,
    borderColor: 'red',
  },
  warning: {
    padding: 1,
    borderStyle: 'round' as const,
    borderColor: 'yellow',
  },
};

/**
 * Spacing constants
 */
export const spacing = {
  small: 1,
  medium: 2,
  large: 3,
};

/**
 * Icons used in the UI
 */
export const icons = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  arrow: '❯',
  bullet: '•',
  check: '✓',
  cross: '✗',
};
