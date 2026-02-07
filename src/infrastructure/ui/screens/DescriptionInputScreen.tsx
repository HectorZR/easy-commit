import { InstructionBuilder } from '@domain/instruction-builder';
import { Box, Text, useInput } from 'ink';
import { CustomFooter, Header, ProgressBar, TextInput } from '../components';
import { text } from '../styles';
import type { ScreenProps } from '../types';

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

  return (
    <Box flexDirection="column">
      <Header
        title="📝 Easy Commit - Description"
        subtitle={<Text>{text.label('Enter a concise description:')}</Text>}
      >
        <ProgressBar current={2} total={5} />
      </Header>

      <Box flexDirection="column" marginTop={1} marginBottom={1} gap={1}>
        <Text italic>
          {text.hint("Use present tense and lowercase (e.g., 'add feature' not 'Added feature')")}
        </Text>
        <Box>
          <Text>{text.value('→')} </Text>
          <TextInput
            initialValue={state.description}
            onSubmit={handleSubmit}
            placeholder="add user authentication"
            limit={MAX_LENGTH}
          />
        </Box>
      </Box>

      <CustomFooter
        hints={new InstructionBuilder().addConfirmation().addBack().addCancel().getSteps()}
      />
    </Box>
  );
};
