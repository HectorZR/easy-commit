import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useState } from 'react';
import { CustomFooter, Header, ProgressBar } from '../components';
import { colors, text } from '../styles';
import type { ScreenProps } from '../types';

/**
 * Breaking Change Screen - Fifth step of the wizard
 * Asks user if this commit introduces breaking changes
 */
export const BreakingChangeScreen: React.FC<ScreenProps> = ({
  state,
  onNext,
  onBack,
  onCancel,
}) => {
  const [selected, setSelected] = useState(state.breaking ? 1 : 0);

  const options = [
    { label: 'No', value: false },
    { label: 'Yes', value: true },
  ];

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setSelected((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow || input === 'j') {
      setSelected((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      const selectedOption = options[selected];
      if (selectedOption) {
        onNext({ breaking: selectedOption.value });
      }
    } else if (key.escape) {
      onCancel();
    } else if (key.ctrl && input === 'b') {
      onBack();
    }
  });

  return (
    <Box flexDirection="column">
      <Header
        title="📝 Easy Commit - Breaking Change"
        subtitle={<Text>{colors.warning('Breaking Change:')}</Text>}
      >
        <ProgressBar current={5} total={7} />
      </Header>

      <Box flexDirection="column" marginTop={1}>
        {options.map((option, index) => {
          const isSelected = index === selected;
          return (
            <Box key={option.label}>
              <Text>
                {isSelected ? colors.primary('❯ ') : '  '}
                {isSelected ? colors.highlight(option.label) : option.label}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1}>
        <Text>{text.hint('(Breaking changes require a major version bump)')}</Text>
      </Box>

      <CustomFooter
        hints={['[j/k] [↑/↓] Select', '[Enter] Confirm', '[Ctrl+B] Back', '[Esc] Cancel']}
      />
    </Box>
  );
};
