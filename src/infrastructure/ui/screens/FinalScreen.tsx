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
        console.log(colors.success('✅ Commit created successfully!'));
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

  const formattedMessage = commit.format();

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

      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Text>{text.label('📝 Commit Preview')}</Text>
        <Box
          flexDirection="column"
          marginTop={1}
          padding={1}
          borderStyle="round"
          borderColor="blueBright"
        >
          {formattedMessage
            .split('\n')
            .filter((line) => Boolean(line))
            .map((line, index) => (
              <Box marginTop={Number(index !== 0)} key={line || `empty-${Math.random()}`}>
                <Text>{colors.highlight(line)}</Text>
              </Box>
            ))}
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
