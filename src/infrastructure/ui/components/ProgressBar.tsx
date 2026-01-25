import { Box, Text } from 'ink';
import type React from 'react';
import { colors } from '../styles';

interface ProgressBarProps {
  current: number;
  total: number;
}

/**
 * Progress bar showing wizard step progress
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = current / total;
  const barWidth = 30;
  const filledWidth = Math.floor(barWidth * progress);
  const emptyWidth = barWidth - filledWidth;

  const filled = '█'.repeat(filledWidth);
  const empty = '░'.repeat(emptyWidth);

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text>
        {colors.primary(filled)}
        {colors.muted(empty)} {current}/{total}
      </Text>
    </Box>
  );
};
