import { Box, Text } from 'ink';
import type React from 'react';
import { text } from '../styles';

/**
 * Footer component displaying navigation hints
 */
export const Footer: React.FC = () => {
  return (
    <Box flexDirection="column" marginTop={1} paddingTop={1} borderStyle="single" borderTop>
      <Text>{text.hint('Use ↑/↓ arrows to navigate, Enter to select, Ctrl+C to cancel')}</Text>
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
    <Box flexDirection="column" marginTop={1} paddingTop={1} borderStyle="single" borderTop>
      {hints.map((hint) => (
        <Text key={hint}>{text.hint(hint)}</Text>
      ))}
    </Box>
  );
};
