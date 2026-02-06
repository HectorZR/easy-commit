import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useState } from 'react';
import { CustomFooter, Header, ProgressBar, TextareaInput, ValidationMessage } from '../components';
import { text } from '../styles';
import type { ScreenProps } from '../types';

const MAX_LENGTH = 500;
/**
 * Body Input Screen - Fourth step of the wizard
 * Allows user to optionally enter a longer commit body
 */
export const BodyInputScreen: React.FC<ScreenProps> = ({ state, onNext, onBack, onCancel }) => {
  const [body, setBody] = useState(state.body || '');
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
        <ProgressBar current={4} total={7} />
      </Header>

      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Text italic>
          {text.hint(
            'Provide additional context about the changes. Use ↑↓ to navigate, Enter for new line.'
          )}
        </Text>
        <Text>{text.hint('Press Ctrl+D or Esc then Enter to finish')}</Text>
        <Box marginTop={1} marginBottom={1}>
          <TextareaInput
            value={body}
            onChange={setBody}
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
        hints={['[Enter] Continue', '[Ctrl+D] Skip', '[Ctrl+B] Back', '[Esc] Cancel']}
      />
    </Box>
  );
};
