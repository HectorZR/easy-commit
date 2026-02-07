import { Box, Text } from 'ink';
import { text } from '../styles';

interface ProgressBarProps {
  current: number;
  total: number;
}

/**
 * Progress bar showing wizard step progress
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  return (
    <Box
      flexDirection="column"
      marginBottom={1}
      borderStyle="single"
      borderTop={false}
      borderLeft={false}
      borderRight={false}
      width={10}
      borderColor="gray"
    >
      <Text italic>{text.subtitle(`Step ${current}/${total}`)}</Text>
    </Box>
  );
};
