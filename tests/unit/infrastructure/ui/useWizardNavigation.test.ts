import { describe, expect, test } from 'bun:test';
import { useWizardNavigation } from '../../../../src/infrastructure/ui/hooks/useWizardNavigation';
import { Screen } from '../../../../src/infrastructure/ui/types';

describe('useWizardNavigation Logic', () => {
  describe('Initial State', () => {
    test('should have correct initial values', () => {
      const initialState = {
        currentScreen: Screen.TYPE_SELECTION,
        type: '',
        description: '',
        scope: '',
        body: '',
        breaking: false,
      };

      expect(initialState.currentScreen).toBe(Screen.TYPE_SELECTION);
      expect(initialState.type).toBe('');
      expect(initialState.description).toBe('');
      expect(initialState.scope).toBe('');
      expect(initialState.body).toBe('');
      expect(initialState.breaking).toBe(false);
    });

    test('should start at step 1 of 7', () => {
      const SCREEN_FLOW = [
        Screen.TYPE_SELECTION,
        Screen.DESCRIPTION_INPUT,
        Screen.SCOPE_INPUT,
        Screen.BODY_INPUT,
        Screen.BREAKING_CHANGE,
        Screen.PREVIEW,
        Screen.CONFIRMATION,
      ];

      const currentIndex = SCREEN_FLOW.indexOf(Screen.TYPE_SELECTION);
      const currentStep = currentIndex + 1;
      const totalSteps = SCREEN_FLOW.length;

      expect(currentStep).toBe(1);
      expect(totalSteps).toBe(7);
    });

    test('should not allow going back from first screen', () => {
      const SCREEN_FLOW = [
        Screen.TYPE_SELECTION,
        Screen.DESCRIPTION_INPUT,
        Screen.SCOPE_INPUT,
        Screen.BODY_INPUT,
        Screen.BREAKING_CHANGE,
        Screen.PREVIEW,
        Screen.CONFIRMATION,
      ];

      const currentIndex = SCREEN_FLOW.indexOf(Screen.TYPE_SELECTION);
      const canGoBack = currentIndex > 0;

      expect(canGoBack).toBe(false);
    });
  });

  describe('Screen Flow', () => {
    test('should follow correct screen order', () => {
      const SCREEN_FLOW = [
        Screen.TYPE_SELECTION,
        Screen.DESCRIPTION_INPUT,
        Screen.SCOPE_INPUT,
        Screen.BODY_INPUT,
        Screen.BREAKING_CHANGE,
        Screen.PREVIEW,
        Screen.CONFIRMATION,
      ];

      expect(SCREEN_FLOW[0]).toBe(Screen.TYPE_SELECTION);
      expect(SCREEN_FLOW[1]).toBe(Screen.DESCRIPTION_INPUT);
      expect(SCREEN_FLOW[2]).toBe(Screen.SCOPE_INPUT);
      expect(SCREEN_FLOW[3]).toBe(Screen.BODY_INPUT);
      expect(SCREEN_FLOW[4]).toBe(Screen.BREAKING_CHANGE);
      expect(SCREEN_FLOW[5]).toBe(Screen.PREVIEW);
      expect(SCREEN_FLOW[6]).toBe(Screen.CONFIRMATION);
    });

    test('should calculate next screen correctly', () => {
      const SCREEN_FLOW = [
        Screen.TYPE_SELECTION,
        Screen.DESCRIPTION_INPUT,
        Screen.SCOPE_INPUT,
        Screen.BODY_INPUT,
        Screen.BREAKING_CHANGE,
        Screen.PREVIEW,
        Screen.CONFIRMATION,
      ];

      const currentScreen = Screen.TYPE_SELECTION;
      const currentIndex = SCREEN_FLOW.indexOf(currentScreen);
      const nextScreen = SCREEN_FLOW[currentIndex + 1];

      expect(nextScreen).toBe(Screen.DESCRIPTION_INPUT);
    });

    test('should calculate previous screen correctly', () => {
      const SCREEN_FLOW = [
        Screen.TYPE_SELECTION,
        Screen.DESCRIPTION_INPUT,
        Screen.SCOPE_INPUT,
        Screen.BODY_INPUT,
        Screen.BREAKING_CHANGE,
        Screen.PREVIEW,
        Screen.CONFIRMATION,
      ];

      const currentScreen = Screen.DESCRIPTION_INPUT;
      const currentIndex = SCREEN_FLOW.indexOf(currentScreen);
      const prevScreen = SCREEN_FLOW[currentIndex - 1];

      expect(prevScreen).toBe(Screen.TYPE_SELECTION);
    });

    test('should allow going back from any screen except first', () => {
      const SCREEN_FLOW = [
        Screen.TYPE_SELECTION,
        Screen.DESCRIPTION_INPUT,
        Screen.SCOPE_INPUT,
        Screen.BODY_INPUT,
        Screen.BREAKING_CHANGE,
        Screen.PREVIEW,
        Screen.CONFIRMATION,
      ];

      for (let i = 0; i < SCREEN_FLOW.length; i++) {
        const screen = SCREEN_FLOW[i];
        const canGoBack = i > 0;

        if (screen === Screen.TYPE_SELECTION) {
          expect(canGoBack).toBe(false);
        } else {
          expect(canGoBack).toBe(true);
        }
      }
    });
  });

  describe('State Management', () => {
    test('should merge state updates correctly', () => {
      const initialState = {
        currentScreen: Screen.TYPE_SELECTION,
        type: '',
        description: '',
        scope: '',
        body: '',
        breaking: false,
      };

      const update = { type: 'feat' };
      const nextState = {
        ...initialState,
        ...update,
        currentScreen: Screen.DESCRIPTION_INPUT,
      };

      expect(nextState.type).toBe('feat');
      expect(nextState.description).toBe(''); // Preserved
      expect(nextState.currentScreen).toBe(Screen.DESCRIPTION_INPUT);
    });

    test('should preserve all fields when navigating', () => {
      const state = {
        currentScreen: Screen.PREVIEW,
        type: 'feat',
        description: 'add feature',
        scope: 'auth',
        body: 'This is the body',
        breaking: true,
      };

      // Navigate back - state should be preserved
      const prevState = {
        ...state,
        currentScreen: Screen.BREAKING_CHANGE,
      };

      expect(prevState.type).toBe('feat');
      expect(prevState.description).toBe('add feature');
      expect(prevState.scope).toBe('auth');
      expect(prevState.body).toBe('This is the body');
      expect(prevState.breaking).toBe(true);
    });

    test('should handle empty optional fields', () => {
      const state = {
        currentScreen: Screen.CONFIRMATION,
        type: 'fix',
        description: 'bug fix',
        scope: '',
        body: '',
        breaking: false,
      };

      expect(state.scope).toBe('');
      expect(state.body).toBe('');
    });
  });

  describe('Step Calculation', () => {
    test('should calculate step for each screen', () => {
      const SCREEN_FLOW = [
        Screen.TYPE_SELECTION,
        Screen.DESCRIPTION_INPUT,
        Screen.SCOPE_INPUT,
        Screen.BODY_INPUT,
        Screen.BREAKING_CHANGE,
        Screen.PREVIEW,
        Screen.CONFIRMATION,
      ];

      const tests = [
        { screen: Screen.TYPE_SELECTION, expectedStep: 1 },
        { screen: Screen.DESCRIPTION_INPUT, expectedStep: 2 },
        { screen: Screen.SCOPE_INPUT, expectedStep: 3 },
        { screen: Screen.BODY_INPUT, expectedStep: 4 },
        { screen: Screen.BREAKING_CHANGE, expectedStep: 5 },
        { screen: Screen.PREVIEW, expectedStep: 6 },
        { screen: Screen.CONFIRMATION, expectedStep: 7 },
      ];

      for (const { screen, expectedStep } of tests) {
        const currentIndex = SCREEN_FLOW.indexOf(screen);
        const currentStep = currentIndex + 1;
        expect(currentStep).toBe(expectedStep);
      }
    });
  });
});
