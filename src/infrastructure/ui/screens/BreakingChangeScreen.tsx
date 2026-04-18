import { Box, Text } from 'ink';
import { CustomFooter, Header, Options, type OptionType, ProgressBar } from '../components';
import { useScreenNavigation } from '../hooks';
import { colors, text } from '../styles';
import type { ScreenProps } from '../types';
import { InstructionBuilder } from '../utils/instruction-builder';

/**
 * Breaking Change Screen - Fifth step of the wizard
 * Asks user if this commit introduces breaking changes
 */
export const BreakingChangeScreen: React.FC<ScreenProps> = ({
  onNext,
  onBack,
  onCancel,
  currentStep,
  totalSteps,
}) => {
  const options: OptionType[] = [
    { label: 'Yes', color: colors.success.bold, onSelect: () => onNext({ breaking: true }) },
    { label: 'No', color: colors.error.bold, onSelect: () => onNext({ breaking: false }) },
  ];

  useScreenNavigation(onBack, onCancel);

  return (
    <Box flexDirection="column">
      <Header
        title="📝 Easy Commit - Breaking Change"
        subtitle={<Text>{text.label('Breaking Change:')}</Text>}
      >
        <ProgressBar current={currentStep} total={totalSteps} />
      </Header>

      <Box marginTop={1} gap={1} flexDirection="column">
        <Text italic>
          {text.hint(
            'Breaking changes require a major version bump according to semantic versioning'
          )}
        </Text>
      </Box>

      <Options
        title="Is this a breaking change?"
        titleColor={colors.warning.bold}
        options={options}
      />

      <Box marginTop={1}>
        <Text>{text.hint('(Breaking changes require a major version bump)')}</Text>
      </Box>

      <CustomFooter
        hints={new InstructionBuilder()
          .addNavigation()
          .addConfirmation()
          .addBack()
          .addCancel()
          .getSteps()}
      />
    </Box>
  );
};
