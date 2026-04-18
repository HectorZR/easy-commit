import { Scope } from '@domain/value-objects/scope';
import { Box, Text } from 'ink';
import { useState } from 'react';
import { CustomFooter, Header, ProgressBar, TextInput, ValidationMessage } from '../components';
import { useScreenNavigation } from '../hooks';
import { text } from '../styles';
import type { ScreenProps } from '../types';
import { InstructionBuilder } from '../utils/instruction-builder';

const MAX_SCOPE_LENGTH = 30;

/**
 * Scope Input Screen - Third step of the wizard
 * Allows user to optionally enter commit scope
 */
export const ScopeInputScreen: React.FC<ScreenProps> = ({
  state,
  onNext,
  onBack,
  onCancel,
  currentStep,
  totalSteps,
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  useScreenNavigation(onBack, onCancel);

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();

    // Scope is optional, empty is valid
    if (trimmed === '') {
      onNext({ scope: '' });
      return;
    }

    const result = Scope.create(trimmed);
    if (!result.ok) {
      setErrors([result.error]);
      return;
    }

    setErrors([]);
    onNext({ scope: trimmed });
  };

  return (
    <Box flexDirection="column">
      <Header
        title="📝 Easy Commit - Scope"
        subtitle={<Text>{text.label('Enter a scope (optional):')}</Text>}
      >
        <ProgressBar current={currentStep} total={totalSteps} />
      </Header>

      <Box flexDirection="column" marginTop={1} marginBottom={1} gap={1}>
        <Text italic>
          {text.hint(
            'Scope indicates which part of the codebase is affected (e.g., api, ui, auth)'
          )}
        </Text>
        <Text>{text.hint('Press Enter to skip')}</Text>
        <Box>
          <Text>{text.value('→')} </Text>
          <TextInput
            initialValue={state.scope}
            onSubmit={handleSubmit}
            placeholder="auth, api, ui, etc. (press Enter to skip)"
            limit={MAX_SCOPE_LENGTH}
            alertLimit={5}
          />
        </Box>
      </Box>

      <ValidationMessage errors={errors} />

      <CustomFooter
        hints={new InstructionBuilder().addConfirmation().addBack().addCancel().getSteps()}
      />
    </Box>
  );
};
