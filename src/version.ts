import { version } from '../package.json';
/**
 * Version information
 * These values will be replaced at build time via environment variables
 */
export const VERSION = version;
export const BUILT_BY = 'HectorZR';

/**
 * Get formatted version string
 */
export function getVersionString(): string {
  return `${VERSION} by ${BUILT_BY}`;
}
