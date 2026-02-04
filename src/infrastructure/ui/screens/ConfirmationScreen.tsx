import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useState } from 'react';
import { CustomFooter, Header, ProgressBar } from '../components';
import { colors, text } from '../styles';
import { Screen, type ScreenProps } from '../types';

/**
 * Confirmation Screen - Final step of the wizard
 * Final confirmation before creating the commit
 */
export const ConfirmationScreen: React.FC<ScreenProps> = ({ state, onNext, onBack, onCancel }) => {
  const [selected, setSelected] = useState(0);

  const options = [
    { label: 'Create commit', value: 'confirm' },
    { label: 'Go back and edit', value: 'back' },
    { label: 'Cancel', value: 'cancel' },
  ];

  useInput((input, key) => {
    if (key.upArrow) {
      setSelected((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    } else if (key.downArrow) {
      setSelected((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      const selectedOption = options[selected];
      if (!selectedOption) return;

      const selectedValue = selectedOption.value;
      if (selectedValue === 'confirm') {
        // Signal that we're ready to create the commit
        onNext({ currentScreen: Screen.EXIT });
      } else if (selectedValue === 'back') {
        onBack();
      } else {
        onCancel();
      }
    } else if (key.escape) {
      onCancel();
    } else if (key.ctrl && input === 'b') {
      onBack();
    }
  });

  return (
    <Box flexDirection="column">
      <Header title="📝 Easy Commit - Confirmation" subtitle="Ready to create the commit?">
        <ProgressBar current={7} total={7} />
      </Header>

      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Text>{text.label('Final check:')}</Text>
        <Box marginTop={1}>
          <Text>
            {text.value(state.type)}
            {state.scope ? `(${text.value(state.scope)})` : ''}
            {': '}
            {text.value(state.description)}
          </Text>
        </Box>
        {state.breaking && (
          <Box marginTop={1}>
            <Text>{text.warning('⚠ This commit introduces breaking changes')}</Text>
          </Box>
        )}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text>{text.label('What would you like to do?')}</Text>
        <Box flexDirection="column" marginTop={1}>
          {options.map((option, index) => {
            const isSelected = index === selected;
            return (
              <Box key={option.value}>
                <Text>
                  {isSelected ? colors.primary('❯ ') : '  '}
                  {isSelected ? colors.highlight(option.label) : option.label}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      <CustomFooter
        hints={['↑/↓ to select', 'Enter to confirm', 'Ctrl+B to go back', 'Esc to cancel']}
      />
    </Box>
  );
};
