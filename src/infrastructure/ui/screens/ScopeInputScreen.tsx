import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import type React from 'react';
import { useState } from 'react';
import { CustomFooter, Header, ProgressBar, ValidationMessage } from '../components';
import { text } from '../styles';
import type { ScreenProps } from '../types';

/**
 * Scope Input Screen - Third step of the wizard
 * Allows user to optionally enter commit scope
 */
export const ScopeInputScreen: React.FC<ScreenProps> = ({ state, onNext, onBack, onCancel }) => {
  const [scope, setScope] = useState(state.scope || '');
  const [errors, setErrors] = useState<string[]>([]);

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
    } else if (key.ctrl && input === 'b') {
      onBack();
    } else if (key.ctrl && input === 's') {
      // Skip scope (Ctrl+S)
      onNext({ scope: '' });
    }
  });

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    const validationErrors: string[] = [];

    // Scope is optional, empty is valid
    if (trimmed === '') {
      onNext({ scope: '' });
      return;
    }

    // Validate scope format if provided
    if (!/^[a-z0-9-]+$/.test(trimmed)) {
      validationErrors.push('Scope must contain only lowercase letters, numbers, and hyphens');
    } else if (trimmed.length > 30) {
      validationErrors.push('Scope too long (max 30 characters)');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onNext({ scope: trimmed });
  };

  return (
    <Box flexDirection="column">
      <Header title="📝 Easy Commit - Scope" subtitle="Optionally specify a scope (optional)" />

      <ProgressBar current={3} total={7} />

      <Box flexDirection="column" marginTop={1} marginBottom={1}>
        <Text>{text.label('Scope (optional):')}</Text>
        <Box marginTop={1}>
          <Text>
            {text.value(state.type)}
            {scope ? `(${text.value(scope)})` : ''}
            {': '}
            {text.hint(state.description)}
          </Text>
        </Box>
        <Box marginTop={1}>
          <TextInput
            value={scope}
            onChange={setScope}
            onSubmit={handleSubmit}
            placeholder="auth, api, ui, etc. (press Enter to skip)"
          />
        </Box>
        <Box marginTop={1}>
          <Text>{text.hint('Examples: auth, api, ui, core, cli')}</Text>
        </Box>
      </Box>

      <ValidationMessage errors={errors} />

      <CustomFooter
        hints={[
          'Enter to submit (or skip)',
          'Ctrl+S to skip',
          'Ctrl+B to go back',
          'Esc to cancel',
        ]}
      />
    </Box>
  );
};
