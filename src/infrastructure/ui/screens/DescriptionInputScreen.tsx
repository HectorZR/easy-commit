import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import type React from 'react';
import { useState } from 'react';
import { CustomFooter, Header, ProgressBar, ValidationMessage } from '../components';
import { text } from '../styles';
import type { ScreenProps } from '../types';

/**
 * Description Input Screen - Second step of the wizard
 * Allows user to enter commit description
 */
export const DescriptionInputScreen: React.FC<ScreenProps> = ({
  state,
  onNext,
  onBack,
  onCancel,
}) => {
  const [description, setDescription] = useState(state.description || '');
  const [errors, setErrors] = useState<string[]>([]);

  const maxLength = 72;
  const remainingChars = maxLength - description.length;

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

    if (!trimmed) {
      validationErrors.push('Description cannot be empty');
    } else if (trimmed.length > maxLength) {
      validationErrors.push(`Description too long (${trimmed.length}/${maxLength})`);
    } else if (trimmed.length > 0) {
      const firstChar = trimmed[0];
      if (firstChar && firstChar !== firstChar.toLowerCase()) {
        validationErrors.push('Description should start with lowercase letter');
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onNext({ description: trimmed });
  };

  return (
    <Box flexDirection="column">
      <Header
        title="📝 Easy Commit - Description"
        subtitle="Provide a short, imperative description of the change"
      />

      <ProgressBar current={2} total={7} />

      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Text>{text.label('Description:')}</Text>
        <Box marginTop={1}>
          <Text>{text.value(state.type)}: </Text>
          <TextInput
            value={description}
            onChange={setDescription}
            onSubmit={handleSubmit}
            placeholder="add user authentication"
          />
        </Box>
        <Box marginTop={1}>
          <Text>
            {remainingChars >= 0
              ? text.hint(`${remainingChars} characters remaining`)
              : text.error(`${Math.abs(remainingChars)} characters over limit`)}
          </Text>
        </Box>
      </Box>

      <ValidationMessage errors={errors} />

      <CustomFooter hints={['Enter to submit', 'Ctrl+B to go back', 'Esc to cancel']} />
    </Box>
  );
};
