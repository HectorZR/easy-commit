import { render } from 'ink';
import type React from 'react';
import type { CommitService } from '../../application/services/commit-service';
import type { Commit } from '../../domain/entities/commit';
import type { Config } from '../config/config-loader';
import { useWizardNavigation } from './hooks';
import {
  BodyInputScreen,
  BreakingChangeScreen,
  ConfirmationScreen,
  DescriptionInputScreen,
  PreviewScreen,
  ScopeInputScreen,
  TypeSelectionScreen,
} from './screens';
import { Screen, type WizardState } from './types';

interface AppProps {
  service: CommitService;
  config: Config;
}

/**
 * Main TUI Application Component
 * Manages wizard flow and screen transitions
 */
const App: React.FC<AppProps> = () => {
  const { state, goNext, goBack } = useWizardNavigation();

  const handleCancel = () => {
    process.exit(0);
  };

  // Render the current screen based on state
  const renderScreen = () => {
    const screenProps = {
      state,
      onNext: goNext,
      onBack: goBack,
      onCancel: handleCancel,
    };

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
        return <PreviewScreen {...screenProps} />;
      case Screen.CONFIRMATION:
        return <ConfirmationScreen {...screenProps} />;
      case Screen.EXIT:
        // Exit will be handled by the parent
        process.exit(0);
        return null;
      default:
        return <TypeSelectionScreen {...screenProps} />;
    }
  };

  return <>{renderScreen()}</>;
};

/**
 * Run the interactive TUI wizard
 * Returns a promise that resolves with the completed commit
 */
export async function runInteractiveTUI(): Promise<Commit> {
  return new Promise((resolve, reject) => {
    let wizardState: WizardState | null = null;

    const AppWrapper: React.FC = () => {
      const { state, goNext, goBack } = useWizardNavigation();

      // Save state for access outside React
      wizardState = state;

      const handleCancel = () => {
        reject(new Error('User cancelled'));
        process.exit(0);
      };

      const handleNext = (updates: Partial<WizardState>) => {
        goNext(updates);

        // Check if we reached EXIT state
        if (updates.currentScreen === Screen.EXIT && wizardState?.commit) {
          resolve(wizardState.commit);
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
            return <PreviewScreen {...screenProps} />;
          case Screen.CONFIRMATION:
            return <ConfirmationScreen {...screenProps} />;
          case Screen.EXIT:
            return null;
          default:
            return <TypeSelectionScreen {...screenProps} />;
        }
      };

      return <>{renderScreen()}</>;
    };

    const { waitUntilExit } = render(<AppWrapper />);

    // Handle exit
    waitUntilExit().then(() => {
      if (wizardState?.commit) {
        resolve(wizardState.commit);
      } else {
        reject(new Error('Wizard exited without creating commit'));
      }
    });
  });
}

export default App;
