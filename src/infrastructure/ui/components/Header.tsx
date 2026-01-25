import { Box, Text } from 'ink';
import type React from 'react';
import { text } from '../styles';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Header component displayed at the top of each screen
 */
export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text>{text.title(title)}</Text>
      {subtitle && <Text>{text.subtitle(subtitle)}</Text>}
    </Box>
  );
};
