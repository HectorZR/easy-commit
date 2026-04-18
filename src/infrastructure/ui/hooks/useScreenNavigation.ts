import { useInput } from 'ink';

/**
 * Handles common keyboard navigation for input screens:
 * - Escape → cancel
 * - Ctrl+B  → go back
 */
export function useScreenNavigation(onBack: () => void, onCancel: () => void): void {
  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    } else if (key.ctrl && input === 'b') {
      onBack();
    }
  });
}
