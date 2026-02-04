import { Box, Text } from 'ink';
import React from 'react';
import { text } from '../styles';

interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

/**
 * Header component displayed at the top of each screen
 */
export const Header: React.FC<HeaderProps> = ({ children, title, subtitle }) => {
  return (
    <Box flexDirection="column">
      <Text>{text.title(title)}</Text>
      {children}
      {subtitle && <Text>{text.subtitle(subtitle)}</Text>}
    </Box>
  );
};
