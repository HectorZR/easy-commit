import { Box, Text, useInput } from 'ink';
import React from 'react';
import { Commit } from '../../../domain/entities/commit';
import { CustomFooter, Header, ProgressBar } from '../components';
import { colors, text } from '../styles';
import type { ScreenProps } from '../types';

/**
 * Preview Screen - Sixth step of the wizard
 * Shows a preview of the formatted commit message
 */
export const PreviewScreen: React.FC<ScreenProps> = ({ state, onNext, onBack, onCancel }) => {
  useInput((input, key) => {
    if (key.return) {
      // Create commit object for next step
      const commit = new Commit(
        state.type,
        state.description,
        state.scope || undefined,
        state.body || undefined,
        state.breaking
      );
      onNext({ commit });
    } else if (key.escape) {
      onCancel();
    } else if (key.ctrl && input === 'b') {
      onBack();
    }
  });

  // Create temporary commit for preview
  const previewCommit = new Commit(
    state.type,
    state.description,
    state.scope || undefined,
    state.body || undefined,
    state.breaking
  );

  const formattedMessage = previewCommit.format();

  return (
    <Box flexDirection="column">
      <Header
        title="📝 Easy Commit - Preview"
        subtitle="Review your commit message before creating"
      >
        <ProgressBar current={6} total={7} />
      </Header>

      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Text>{text.label('Commit Message Preview:')}</Text>
        <Box
          flexDirection="column"
          marginTop={1}
          padding={1}
          borderStyle="round"
          borderColor="cyan"
        >
          {formattedMessage.split('\n').map((line) => (
            <Text key={line || `empty-${Math.random()}`}>{colors.highlight(line)}</Text>
          ))}
        </Box>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text>{text.label('Summary:')}</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>
            {text.hint('Type: ')}
            {text.value(state.type)}
          </Text>
          {state.scope && (
            <Text>
              {text.hint('Scope: ')}
              {text.value(state.scope)}
            </Text>
          )}
          <Text>
            {text.hint('Description: ')}
            {text.value(state.description)}
          </Text>
          {state.body && (
            <Text>
              {text.hint('Body: ')}
              {text.value(state.body.substring(0, 50))}
              {state.body.length > 50 ? '...' : ''}
            </Text>
          )}
          {state.breaking && <Text>{text.warning('⚠ Breaking Change')}</Text>}
        </Box>
      </Box>

      <CustomFooter hints={['Enter to continue', 'Ctrl+B to go back', 'Esc to cancel']} />
    </Box>
  );
};
