import { Commit } from '@domain/index';
import { Box, Text, useInput } from 'ink';
import React from 'react';
import { Screen, type ScreenProps } from '../types';
import { CustomFooter, Header, Options, type OptionType, ProgressBar } from '../components';
import { colors, text } from '../styles';
import { InstructionBuilder } from '@domain/instruction-builder';

interface FinalScreenProps extends ScreenProps {
  mode: 'preview' | 'confirmation';
}

export function FinalScreen({ state, onNext, onBack, onCancel, mode }: FinalScreenProps) {
  const commit = new Commit(
    state.type,
    state.description,
    state.scope || undefined,
    state.body || undefined,
    state.breaking
  );

  const options: OptionType[] = [
    {
      label: 'Yes',
      onSelect: () => {
        onNext({ currentScreen: Screen.EXIT });
      },
      color: colors.success.bold,
    },
    { label: 'No', onSelect: onCancel, color: colors.error.bold },
  ];

  useInput((input, key) => {
    if (mode === 'preview' && key.return) {
      onNext({ currentScreen: Screen.CONFIRMATION, commit });
      return;
    }

    if (key.escape) {
      onCancel();
    } else if (key.ctrl && input === 'b') {
      onBack();
    }
  });

  return (
    <Box flexDirection="column">
      <Header
        title={`📝 Easy Commit - ${mode === 'preview' ? 'Preview' : 'Confirmation'}`}
        subtitle={
          <Text>
            {text.label(mode === 'preview' ? 'Preview Commit:' : 'Confirm Commit Creation')}
          </Text>
        }
      >
        <ProgressBar current={5} total={5} />
      </Header>

      <Box flexDirection="column" marginTop={1} marginBottom={1} gap={1}>
        <Text>{text.label('📝 Commit Preview')}</Text>
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="blueBright">
          {/* Header */}
          <Text>{colors.highlight(commit.getHeader())}</Text>

          {/* Body */}
          {commit.body && (
            <Box marginTop={1} flexDirection="column">
              {commit
                .getBody()
                .split('\n')
                .map((line) => (
                  <Text key={line}>{colors.highlight(line)}</Text>
                ))}
            </Box>
          )}

          {/* Breaking Changes Footer */}
          {commit.isBreaking() && (
            <Box marginTop={1}>
              <Text>{colors.highlight(commit.getBreaking())}</Text>
            </Box>
          )}
        </Box>
      </Box>

      {mode === 'confirmation' && <Options title="Create this commit?" options={options} />}

      <CustomFooter
        hints={new InstructionBuilder()
          .addNavigation()
          .addConfirmation()
          .addBack()
          .addCancel()
          .getSteps()}
      />
    </Box>
  );
}
