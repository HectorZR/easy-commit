import type { Commit } from '../../domain/entities/commit';

/**
 * Navigation screens in the wizard flow
 */
export enum Screen {
  TYPE_SELECTION = 'TYPE_SELECTION',
  DESCRIPTION_INPUT = 'DESCRIPTION_INPUT',
  SCOPE_INPUT = 'SCOPE_INPUT',
  BODY_INPUT = 'BODY_INPUT',
  BREAKING_CHANGE = 'BREAKING_CHANGE',
  PREVIEW = 'PREVIEW',
  CONFIRMATION = 'CONFIRMATION',
  EXIT = 'EXIT',
}

/**
 * State for the entire wizard
 */
export interface WizardState {
  currentScreen: Screen;
  type: string;
  description: string;
  scope: string;
  body: string;
  breaking: boolean;
  commit?: Commit;
}

/**
 * Common props for all screens
 */
export interface ScreenProps {
  state: WizardState;
  onNext: (updates: Partial<WizardState>) => void;
  onBack: () => void;
  onCancel: () => void;
}

/**
 * Navigation action types
 */
export type NavigationAction =
  | { type: 'NEXT'; payload: Partial<WizardState> }
  | { type: 'BACK' }
  | { type: 'CANCEL' }
  | { type: 'SET_SCREEN'; payload: Screen };
