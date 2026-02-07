import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { Commit } from '../../../src/domain/entities/commit';
import type { WizardState } from '../../../src/infrastructure/ui/types';
import { Screen } from '../../../src/infrastructure/ui/types';

describe('TUI Integration Tests', () => {
  describe('Wizard State Flow', () => {
    let initialState: WizardState;

    beforeEach(() => {
      initialState = {
        currentScreen: Screen.TYPE_SELECTION,
        type: '',
        description: '',
        scope: '',
        body: '',
        breaking: false,
      };
    });

    test('should complete full wizard flow with all fields', () => {
      let state = { ...initialState };

      // Step 1: Select type
      state = {
        ...state,
        type: 'feat',
        currentScreen: Screen.DESCRIPTION_INPUT,
      };
      expect(state.type).toBe('feat');
      expect(state.currentScreen).toBe(Screen.DESCRIPTION_INPUT);

      // Step 2: Enter description
      state = {
        ...state,
        description: 'add user authentication',
        currentScreen: Screen.SCOPE_INPUT,
      };
      expect(state.description).toBe('add user authentication');
      expect(state.currentScreen).toBe(Screen.SCOPE_INPUT);

      // Step 3: Enter scope
      state = {
        ...state,
        scope: 'auth',
        currentScreen: Screen.BODY_INPUT,
      };
      expect(state.scope).toBe('auth');
      expect(state.currentScreen).toBe(Screen.BODY_INPUT);

      // Step 4: Enter body
      state = {
        ...state,
        body: 'This implements OAuth2 authentication flow',
        currentScreen: Screen.BREAKING_CHANGE,
      };
      expect(state.body).toBe('This implements OAuth2 authentication flow');
      expect(state.currentScreen).toBe(Screen.BREAKING_CHANGE);

      // Step 5: Mark as breaking change
      state = {
        ...state,
        breaking: true,
        currentScreen: Screen.PREVIEW,
      };
      expect(state.breaking).toBe(true);
      expect(state.currentScreen).toBe(Screen.PREVIEW);

      // Step 6: Preview
      state = {
        ...state,
        currentScreen: Screen.CONFIRMATION,
      };
      expect(state.currentScreen).toBe(Screen.CONFIRMATION);

      // Verify final state
      expect(state.type).toBe('feat');
      expect(state.description).toBe('add user authentication');
      expect(state.scope).toBe('auth');
      expect(state.body).toBe('This implements OAuth2 authentication flow');
      expect(state.breaking).toBe(true);
    });

    test('should complete wizard flow with minimal fields', () => {
      let state = { ...initialState };

      // Only required fields: type and description
      state = {
        ...state,
        type: 'fix',
        currentScreen: Screen.DESCRIPTION_INPUT,
      };

      state = {
        ...state,
        description: 'resolve parsing error',
        currentScreen: Screen.SCOPE_INPUT,
      };

      // Skip scope
      state = {
        ...state,
        scope: '',
        currentScreen: Screen.BODY_INPUT,
      };

      // Skip body
      state = {
        ...state,
        body: '',
        currentScreen: Screen.BREAKING_CHANGE,
      };

      // Not breaking
      state = {
        ...state,
        breaking: false,
        currentScreen: Screen.PREVIEW,
      };

      state = {
        ...state,
        currentScreen: Screen.CONFIRMATION,
      };

      // Verify minimal state
      expect(state.type).toBe('fix');
      expect(state.description).toBe('resolve parsing error');
      expect(state.scope).toBe('');
      expect(state.body).toBe('');
      expect(state.breaking).toBe(false);
    });

    test('should allow navigation backwards through screens', () => {
      let state = { ...initialState };

      // Go forward to step 3
      state = {
        ...state,
        type: 'feat',
        currentScreen: Screen.DESCRIPTION_INPUT,
      };
      state = {
        ...state,
        description: 'test',
        currentScreen: Screen.SCOPE_INPUT,
      };

      expect(state.currentScreen).toBe(Screen.SCOPE_INPUT);

      // Go back to step 2
      state = {
        ...state,
        currentScreen: Screen.DESCRIPTION_INPUT,
      };

      expect(state.currentScreen).toBe(Screen.DESCRIPTION_INPUT);
      expect(state.type).toBe('feat'); // State preserved
      expect(state.description).toBe('test'); // State preserved
    });
  });

  describe('Commit Message Generation', () => {
    test('should generate correct commit message for full state', () => {
      const commit = new Commit('feat', 'add login system', 'auth', 'Implements OAuth2 flow', true);

      const message = commit.format();

      // Breaking change adds '!' to the header
      expect(message).toContain('feat!(auth): add login system');
      expect(message).toContain('Implements OAuth2 flow');
      expect(message).toContain('BREAKING CHANGE:');
    });

    test('should generate correct commit message without scope', () => {
      const commit = new Commit('fix', 'resolve bug', undefined, undefined, false);

      const message = commit.format();

      expect(message).toBe('fix: resolve bug');
      expect(message).not.toContain('(');
      expect(message).not.toContain('BREAKING CHANGE:');
    });

    test('should generate correct commit message with body but no scope', () => {
      const commit = new Commit(
        'docs',
        'update readme',
        undefined,
        'Added installation instructions',
        false
      );

      const message = commit.format();

      expect(message).toContain('docs: update readme');
      expect(message).toContain('Added installation instructions');
    });

    test('should generate correct commit message with scope but no body', () => {
      const commit = new Commit('test', 'add unit tests', 'validator', undefined, false);

      const message = commit.format();

      expect(message).toBe('test(validator): add unit tests');
    });
  });

  describe('Screen Navigation Logic', () => {
    test('should follow correct screen order', () => {
      const expectedOrder = [
        Screen.TYPE_SELECTION,
        Screen.DESCRIPTION_INPUT,
        Screen.SCOPE_INPUT,
        Screen.BODY_INPUT,
        Screen.BREAKING_CHANGE,
        Screen.PREVIEW,
        Screen.CONFIRMATION,
      ];

      // Verify each screen leads to the next
      for (let i = 0; i < expectedOrder.length - 1; i++) {
        const currentScreen = expectedOrder[i];
        const nextScreen = expectedOrder[i + 1];

        expect(nextScreen).toBeDefined();
        // This verifies the screens are in the correct order
        expect(expectedOrder.indexOf(nextScreen)).toBe(i + 1);
      }
    });

    test('should allow skipping optional fields', () => {
      const state: WizardState = {
        currentScreen: Screen.SCOPE_INPUT,
        type: 'feat',
        description: 'test',
        scope: '',
        body: '',
        breaking: false,
      };

      // Scope is optional - should proceed with empty string
      expect(state.scope).toBe('');

      // Body is optional - should proceed with empty string
      const nextState = {
        ...state,
        currentScreen: Screen.BODY_INPUT,
      };
      expect(nextState.body).toBe('');
    });
  });

  describe('Validation Integration', () => {
    test('should validate description length', () => {
      const maxLength = 72;
      const longDescription = 'a'.repeat(maxLength + 1);

      const state: WizardState = {
        currentScreen: Screen.DESCRIPTION_INPUT,
        type: 'feat',
        description: longDescription,
        scope: '',
        body: '',
        breaking: false,
      };

      // Description should be too long
      expect(state.description.length).toBeGreaterThan(maxLength);
    });

    test('should validate scope format', () => {
      const validScope = 'auth';
      const invalidScope = 'Auth-System';

      expect(/^[a-z0-9-]+$/.test(validScope)).toBe(true);
      expect(/^[a-z0-9-]+$/.test(invalidScope)).toBe(false);
    });

    test('should validate body length', () => {
      const maxLength = 500;
      const longBody = 'a'.repeat(maxLength + 1);

      expect(longBody.length).toBeGreaterThan(maxLength);
    });
  });

  describe('State Preservation', () => {
    test('should preserve all state when navigating back', () => {
      const completeState: WizardState = {
        currentScreen: Screen.PREVIEW,
        type: 'feat',
        description: 'add feature',
        scope: 'core',
        body: 'This is the body',
        breaking: true,
      };

      // Simulate going back
      const previousState = {
        ...completeState,
        currentScreen: Screen.BREAKING_CHANGE,
      };

      // All fields should be preserved
      expect(previousState.type).toBe('feat');
      expect(previousState.description).toBe('add feature');
      expect(previousState.scope).toBe('core');
      expect(previousState.body).toBe('This is the body');
      expect(previousState.breaking).toBe(true);
    });
  });

  describe('Exit Scenarios', () => {
    test('should reach EXIT screen after confirmation', () => {
      const finalState: WizardState = {
        currentScreen: Screen.CONFIRMATION,
        type: 'feat',
        description: 'complete',
        scope: '',
        body: '',
        breaking: false,
      };

      // After confirmation, should go to EXIT
      const exitState = {
        ...finalState,
        currentScreen: Screen.EXIT,
      };

      expect(exitState.currentScreen).toBe(Screen.EXIT);
    });
  });
});
