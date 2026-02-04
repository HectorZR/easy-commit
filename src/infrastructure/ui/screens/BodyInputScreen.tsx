import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import React from 'react';
import { useState } from 'react';
import { CustomFooter, Header, ProgressBar, ValidationMessage } from '../components';
import { text } from '../styles';
import type { ScreenProps } from '../types';

/**
 * Body Input Screen - Fourth step of the wizard
 * Allows user to optionally enter a longer commit body
 */
export const BodyInputScreen: React.FC<ScreenProps> = ({ state, onNext, onBack, onCancel }) => {
  const [body, setBody] = useState(state.body || '');
  const [errors, setErrors] = useState<string[]>([]);

  const maxLength = 500;
  const remainingChars = maxLength - body.length;

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    } else if (key.ctrl && input === 'b') {
      onBack();
    } else if (key.ctrl && input === 's') {
      // Skip body (Ctrl+S)
      onNext({ body: '' });
    }
  });

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    const validationErrors: string[] = [];

    // Body is optional, empty is valid
    if (trimmed === '') {
      onNext({ body: '' });
      return;
    }

    // Validate body length if provided
    if (trimmed.length > maxLength) {
      validationErrors.push(`Body too long (${trimmed.length}/${maxLength})`);
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
      <Header title="📝 Easy Commit - Body" subtitle="Provide additional context (optional)">
        <ProgressBar current={4} total={7} />
      </Header>

      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Text>{text.label('Body (optional):')}</Text>
        <Box marginTop={1}>
          <Text>
            {text.value(state.type)}
            {state.scope ? `(${text.value(state.scope)})` : ''}
            {': '}
            {text.hint(state.description)}
          </Text>
        </Box>
        <Box marginTop={1} marginBottom={1}>
          <TextInput
            value={body}
            onChange={setBody}
            onSubmit={handleSubmit}
            placeholder="Explain why this change is being made (press Enter to skip)"
          />
        </Box>
        <Box>
          <Text>
            {remainingChars >= 0
              ? text.hint(`${remainingChars} characters remaining`)
              : text.error(`${Math.abs(remainingChars)} characters over limit`)}
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text>{text.hint('Tip: Explain the motivation for the change, not what changed')}</Text>
        </Box>
      </Box>

      <ValidationMessage errors={errors} />

      <CustomFooter
        hints={[
          'Enter to submit (or skip)',
          'Ctrl+S to skip',
          'Ctrl+B to go back',
          'Esc to cancel',
        ]}
      />
    </Box>
  );
};
