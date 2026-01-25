import { Box, Text } from 'ink';
import type React from 'react';
import { text } from '../styles';

interface ErrorMessageProps {
  message: string;
}

/**
 * Error message component
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <Box marginTop={1}>
      <Text>{text.error(message)}</Text>
    </Box>
  );
};

interface ValidationMessageProps {
  errors: string[];
}

/**
 * Validation errors component
 */
export const ValidationMessage: React.FC<ValidationMessageProps> = ({ errors }) => {
  if (errors.length === 0) return null;

  return (
    <Box flexDirection="column" marginTop={1}>
      {errors.map((error) => (
        <Text key={error}>{text.error(error)}</Text>
      ))}
    </Box>
  );
};
