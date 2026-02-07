import { useCallback, useState } from 'react';
import { Screen, type WizardState } from '../types';

/**
 * Screen flow order for navigation
 */
const SCREEN_FLOW: Screen[] = [
  Screen.TYPE_SELECTION,
  Screen.DESCRIPTION_INPUT,
  Screen.SCOPE_INPUT,
  Screen.BODY_INPUT,
  Screen.BREAKING_CHANGE,
  Screen.PREVIEW,
  Screen.CONFIRMATION,
];

/**
 * Initial wizard state
 */
const INITIAL_STATE: WizardState = {
  currentScreen: Screen.TYPE_SELECTION,
  type: '',
  description: '',
  scope: '',
  body: '',
  breaking: false,
};

interface UseWizardNavigationReturn {
  state: WizardState;
  goNext: (updates: Partial<WizardState>) => void;
  goBack: () => void;
  goToScreen: (screen: Screen) => void;
  canGoBack: boolean;
  currentStep: number;
  totalSteps: number;
}

/**
 * Hook for managing wizard navigation state
 */
export function useWizardNavigation(): UseWizardNavigationReturn {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  const currentIndex = SCREEN_FLOW.indexOf(state.currentScreen);
  const canGoBack = currentIndex > 0;

  /**
   * Move to the next screen with state updates
   */
  const goNext = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => {
      const currentIndex = SCREEN_FLOW.indexOf(prev.currentScreen);
      const nextScreen = SCREEN_FLOW[currentIndex + 1] || Screen.EXIT;

      return {
        ...prev,
        ...updates,
        currentScreen: nextScreen,
      };
    });
  }, []);

  /**
   * Go back to the previous screen
   */
  const goBack = useCallback(() => {
    setState((prev: WizardState): WizardState => {
      const currentIndex = SCREEN_FLOW.indexOf(prev.currentScreen);
      if (currentIndex > 0) {
        const prevScreen = SCREEN_FLOW[currentIndex - 1];
        if (prevScreen) {
          return {
            ...prev,
            currentScreen: prevScreen,
          };
        }
      }
      return prev;
    });
  }, []);

  /**
   * Jump to a specific screen
   */
  const goToScreen = useCallback((screen: Screen) => {
    setState(
      (prev: WizardState): WizardState => ({
        ...prev,
        currentScreen: screen,
      })
    );
  }, []);

  return {
    state,
    goNext,
    goBack,
    goToScreen,
    canGoBack,
    currentStep: currentIndex + 1,
    totalSteps: SCREEN_FLOW.length,
  };
}
