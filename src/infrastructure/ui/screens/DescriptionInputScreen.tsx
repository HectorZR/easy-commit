import React from 'react';
import { useState } from 'react';
import { TextInput } from '../components';
import type { ScreenProps } from '../types';
import { Box, Text, useInput } from 'ink';
import { CustomFooter, Header, ProgressBar } from '../components';
import { text } from '../styles';
import { InstructionBuilder } from '@domain/instruction-builder';

const MAX_LENGTH = 72;
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

  const currentChars = description.length;

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    } else if (key.ctrl && input === 'b') {
      onBack();
    }
  });

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();

    const firstChar = trimmed?.[0];
    if (
      !trimmed ||
      trimmed.length > MAX_LENGTH ||
      (trimmed.length > 0 && firstChar && firstChar !== firstChar.toLowerCase())
    ) {
      return;
    }

    onNext({ description: trimmed });
  };

  const handleChange = (value: string) => {
    setDescription(value);
  };

  return (
    <Box flexDirection="column">
      <Header
        title="📝 Easy Commit - Description"
        subtitle={<Text>{text.label('Enter a concise description:')}</Text>}
      >
        <ProgressBar current={2} total={5} />
      </Header>

      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Text italic>
          {text.hint("Use present tense and lowercase (e.g., 'add feature' not 'Added feature')")}
        </Text>
        <Box marginTop={1}>
          <Text>{text.value('→')} </Text>
          <TextInput
            value={description}
            onChange={handleChange}
            onSubmit={handleSubmit}
            placeholder="add user authentication"
            limit={MAX_LENGTH}
          />
        </Box>
        <Box marginTop={1}>
          <Text>
            {text.hint('Characters: ')}
            {currentChars > MAX_LENGTH - 15
              ? text.warning(`${currentChars}/${MAX_LENGTH}`)
              : text.success(`${currentChars}/${MAX_LENGTH}`)}
          </Text>
        </Box>
      </Box>

      <CustomFooter
        hints={new InstructionBuilder().addConfirmation().addBack().addCancel().getSteps()}
      />
    </Box>
  );
};
