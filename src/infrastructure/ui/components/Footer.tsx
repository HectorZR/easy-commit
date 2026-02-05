import { Box, Text } from 'ink';
import React from 'react';
import { text } from '../styles';

/**
 * Footer component displaying navigation hints
 */
export const Footer: React.FC = () => {
  return (
    <Box flexDirection="column" gap={1} marginTop={1} paddingTop={1}>
      <Text>{text.hint('  ↑/k up • ↓/j down • / filter • q quit')}</Text>
      <Text>{text.hint('[↑↓] Navigate  [Enter] Select  [Ctrl+C] Cancel')}</Text>
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
