import { Box, Text, useInput } from 'ink';
import React from 'react';
import { useState } from 'react';
import { COMMIT_TYPES } from '../../../domain/entities/commit-type';
import { Footer, Header, ProgressBar } from '../components';
import { colors, text } from '../styles';
import type { ScreenProps } from '../types';

/**
 * Type Selection Screen - First step of the wizard
 * Allows user to select commit type from predefined list
 */
export const TypeSelectionScreen: React.FC<ScreenProps> = ({ onNext, onCancel }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : COMMIT_TYPES.length - 1));
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => (prev < COMMIT_TYPES.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      const selectedType = COMMIT_TYPES[selectedIndex];
      if (selectedType) {
        onNext({ type: selectedType.name });
      }
    } else if (key.escape || (key.ctrl && input === 'c') || input === 'q') {
      onCancel();
    }
  });

  return (
    <Box flexDirection="column">
      <Header
        title="📝 Easy Commit - Commit Type"
        subtitle={<Text>{text.label('Select a commit type:')}</Text>}
      >
        <ProgressBar current={1} total={5} />
      </Header>

      <Box flexDirection="column" marginTop={1} gap={1}>
        <Text>{text.hint("Select the type of change you're committing")}</Text>
        <Box flexDirection="column">
          {COMMIT_TYPES.map((commitType, index) => {
            const isSelected = index === selectedIndex;
            return (
              <Box key={commitType.name} marginBottom={0}>
                <Text>
                  {isSelected ? colors.primary(`❯ ${commitType.name}`) : `  ${commitType.name}`}
                </Text>
                <Text> - </Text>
                <Text>
                  {isSelected
                    ? colors.highlight(commitType.description)
                    : text.subtitle(commitType.description)}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};
