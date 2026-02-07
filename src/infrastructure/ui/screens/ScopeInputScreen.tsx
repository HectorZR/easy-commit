import { InstructionBuilder } from '@domain/instruction-builder';
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { CustomFooter, Header, ProgressBar, TextInput, ValidationMessage } from '../components';
import { text } from '../styles';
import type { ScreenProps } from '../types';

const MAX_SCOPE_LENGTH = 20;

/**
 * Scope Input Screen - Third step of the wizard
 * Allows user to optionally enter commit scope
 */
export const ScopeInputScreen: React.FC<ScreenProps> = ({ state, onNext, onBack, onCancel }) => {
  const [errors, setErrors] = useState<string[]>([]);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    } else if (key.ctrl && input === 'b') {
      onBack();
    }
  });

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    const validationErrors: string[] = [];

    // Scope is optional, empty is valid
    if (trimmed === '') {
      onNext({ scope: '' });
      return;
    }

    // Validate scope format if provided
    if (!/^[a-z0-9-]+$/.test(trimmed)) {
      validationErrors.push('Scope must contain only lowercase letters, numbers, and hyphens');
    } else if (trimmed.length > MAX_SCOPE_LENGTH) {
      validationErrors.push(`Scope too long (max ${MAX_SCOPE_LENGTH} characters)`);
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
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
        <ProgressBar current={3} total={5} />
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
