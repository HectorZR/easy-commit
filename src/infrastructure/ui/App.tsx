import { render, useApp } from 'ink';
import type { Commit } from '../../domain/entities/commit';
import { useWizardNavigation } from './hooks';
import {
  BodyInputScreen,
  BreakingChangeScreen,
  DescriptionInputScreen,
  FinalScreen,
  ScopeInputScreen,
  TypeSelectionScreen,
} from './screens';
import { Screen, type WizardState } from './types';

/**
 * Run the interactive TUI wizard
 * Returns a promise that resolves with the completed commit
 */
export async function runInteractiveTUI(): Promise<Commit | null> {
  return new Promise((resolve, reject) => {
    let wizardState: WizardState | null = null;

    const AppWrapper: React.FC = () => {
      const { state, goNext, goBack } = useWizardNavigation();
      const { exit } = useApp();

      // Save state for access outside React
      wizardState = state;

      const handleCancel = () => {
        exit();
      };

      const handleNext = (updates: Partial<WizardState>) => {
        goNext(updates);

        // Check if we reached EXIT state
        if (updates.currentScreen === Screen.EXIT && wizardState?.commit) {
          resolve(wizardState.commit);
          exit();
        }
      };

      const screenProps = {
        state,
        onNext: handleNext,
        onBack: goBack,
        onCancel: handleCancel,
      };

      const renderScreen = () => {
        switch (state.currentScreen) {
          case Screen.TYPE_SELECTION:
            return <TypeSelectionScreen {...screenProps} />;
          case Screen.DESCRIPTION_INPUT:
            return <DescriptionInputScreen {...screenProps} />;
          case Screen.SCOPE_INPUT:
            return <ScopeInputScreen {...screenProps} />;
          case Screen.BODY_INPUT:
            return <BodyInputScreen {...screenProps} />;
          case Screen.BREAKING_CHANGE:
            return <BreakingChangeScreen {...screenProps} />;
          case Screen.PREVIEW:
            return <FinalScreen {...screenProps} mode="preview" />;
          case Screen.CONFIRMATION:
            return <FinalScreen {...screenProps} mode="confirmation" />;
          case Screen.EXIT:
            return null;
          default:
            return <TypeSelectionScreen {...screenProps} />;
        }
      };

      return <>{renderScreen()}</>;
    };

    const { waitUntilExit } = render(<AppWrapper />, { incrementalRendering: true });

    // Handle exit
    waitUntilExit().then(
      () => {
        resolve(wizardState?.commit || null);
      },
      () => {
        reject(new Error('Wizard exited with an error'));
      }
    );
  });
}
