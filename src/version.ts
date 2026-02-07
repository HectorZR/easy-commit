/**
 * Version information
 * These values will be replaced at build time via environment variables
 */
export const VERSION = process.env.VERSION || 'dev';
export const COMMIT = process.env.COMMIT || 'none';
export const BUILD_DATE = process.env.BUILD_DATE || 'unknown';
export const BUILT_BY = process.env.BUILT_BY || 'unknown';

/**
 * Get formatted version string
 */
export function getVersionString(): string {
  return `easy-commit ${VERSION} (${COMMIT}) built on ${BUILD_DATE} by ${BUILT_BY}`;
}
