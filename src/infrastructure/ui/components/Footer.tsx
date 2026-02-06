import { Box, Text } from 'ink';
import React from 'react';
import { text } from '../styles';
import { InstructionBuilder } from '@domain/instruction-builder';

/**
 * Footer component displaying navigation hints
 */
export const Footer: React.FC = () => {
  const instruction = new InstructionBuilder()
    .addNavigation()
    .addConfirmation()
    .addCancel()
    .format();
  return (
    <Box flexDirection="column" gap={1} marginTop={1} paddingTop={1}>
      <Text>{text.hint(instruction)}</Text>
    </Box>
  );
};

interface CustomFooterProps {
  hints: string[];
}

/**
 * Custom footer with specific hints
 */
export const CustomFooter: React.FC<CustomFooterProps> = ({ hints }) => {
  return (
    <Box flexDirection="row" gap={2} marginTop={1} paddingTop={1}>
      {hints.map((hint) => (
        <Text key={hint}>{text.hint(hint)}</Text>
      ))}
    </Box>
  );
};
