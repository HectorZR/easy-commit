import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useState } from 'react';
import { CustomFooter, Header, ProgressBar, TextareaInput, ValidationMessage } from '../components';
import { text } from '../styles';
import type { ScreenProps } from '../types';
import { InstructionBuilder } from '@domain/instruction-builder';

const MAX_LENGTH = 500;
/**
 * Body Input Screen - Fourth step of the wizard
 * Allows user to optionally enter a longer commit body
 */
export const BodyInputScreen: React.FC<ScreenProps> = ({ state, onNext, onBack, onCancel }) => {
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

    // Validate body length if provided
    if (trimmed.length > MAX_LENGTH) {
      validationErrors.push(`Body too long (${trimmed.length}/${MAX_LENGTH})`);
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onNext({ body: trimmed });
  };

  return (
    <Box flexDirection="column">
      <Header
        title="📝 Easy Commit - Body"
        subtitle={<Text>{text.label('Enter detailed description (optional):')}</Text>}
      >
        <ProgressBar current={4} total={5} />
      </Header>

      <Box flexDirection="column" marginTop={1} marginBottom={1} gap={1}>
        <Text italic>
          {text.hint(
            'Provide additional context about the changes. Use ↑↓ to navigate, Enter for new line.'
          )}
        </Text>
        <Box marginBottom={1}>
          <TextareaInput
            initialValue={state.body || ''}
            onSubmit={handleSubmit}
            placeholder="Detailed explanation... (optional)"
            width={60}
            height={5}
            limit={MAX_LENGTH}
          />
        </Box>
      </Box>

      <ValidationMessage errors={errors} />

      <CustomFooter
        hints={new InstructionBuilder()
          .addCustomHint('[Ctrl+D] Continue')
          .addBack()
          .addCancel()
          .getSteps()}
      />
    </Box>
  );
};
