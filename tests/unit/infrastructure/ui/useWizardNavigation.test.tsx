import { describe, expect, test } from 'bun:test';
import { render } from 'ink-testing-library';
import { useWizardNavigation } from '../../../../src/infrastructure/ui/hooks/useWizardNavigation';
import { Screen } from '../../../../src/infrastructure/ui/types';

// Helper component to expose the hook for testing
function HookProbe({ callback }: { callback: (val: unknown) => void }) {
  const result = useWizardNavigation();
  // Call the callback on every render with the latest result
  callback(result);
  return null;
}

// Helper to render hook and get result in a stable container
function renderHook() {
  // biome-ignore lint: noExplicitAny
  const resultsContainer = { current: null as any };

  const { rerender, unmount } = render(
    <HookProbe
      callback={(val) => {
        resultsContainer.current = val;
      }}
    />
  );

  return {
    // Getter always returns the LATEST value from the container
    get result() {
      return resultsContainer.current;
    },
    rerender: () =>
      rerender(
        <HookProbe
          callback={(val) => {
            resultsContainer.current = val;
          }}
        />
      ),
    unmount,
  };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('useWizardNavigation Hook', () => {
  test('should initialize with default state', () => {
    const { result } = renderHook();

    expect(result.state.currentScreen).toBe(Screen.TYPE_SELECTION);
    expect(result.state.type).toBe('');
    expect(result.currentStep).toBe(1);
    expect(result.canGoBack).toBe(false);
  });

  test('should navigate to next screen and update state', async () => {
    const hook = renderHook();

    // Use current result to call function
    hook.result.goNext({ type: 'feat' });

    // Wait for React state update
    await delay(10);

    // Rerender to ensure we capture any effect-based updates (though not strictly needed if state drove the update)
    hook.rerender();

    // Access the property fresh from the getter
    expect(hook.result.state.type).toBe('feat');
    expect(hook.result.state.currentScreen).toBe(Screen.DESCRIPTION_INPUT);
    expect(hook.result.currentStep).toBe(2);
    expect(hook.result.canGoBack).toBe(true);
  });

  test('should navigate back to previous screen', async () => {
    const hook = renderHook();

    // Go forward first
    hook.result.goNext({ type: 'fix' });
    await delay(10);
    hook.rerender();

    expect(hook.result.state.currentScreen).toBe(Screen.DESCRIPTION_INPUT);

    // Go back
    hook.result.goBack();
    await delay(10);
    hook.rerender();

    expect(hook.result.state.currentScreen).toBe(Screen.TYPE_SELECTION);
    expect(hook.result.state.type).toBe('fix'); // State should be preserved
    expect(hook.result.currentStep).toBe(1);
  });

  test('should navigate to specific screen', async () => {
    const hook = renderHook();

    hook.result.goToScreen(Screen.CONFIRMATION);
    await delay(10);
    hook.rerender();

    expect(hook.result.state.currentScreen).toBe(Screen.CONFIRMATION);
    expect(hook.result.currentStep).toBe(7);
  });

  test('should not go back from first screen', async () => {
    const hook = renderHook();

    expect(hook.result.state.currentScreen).toBe(Screen.TYPE_SELECTION);

    hook.result.goBack();
    await delay(10);
    hook.rerender();

    expect(hook.result.state.currentScreen).toBe(Screen.TYPE_SELECTION);
  });

  test('should correct calculate total steps', () => {
    const { result } = renderHook();
    expect(result.totalSteps).toBe(7);
  });
});
