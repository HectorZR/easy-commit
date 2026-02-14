import { Box, Text, useInput } from 'ink';
import { useEffect, useState } from 'react';
import { text } from '../styles';

interface TextInputProps {
  initialValue: string | undefined;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  limit?: number;
  alertLimit?: number;
}

/**
 * Custom Text Input component
 * Handles keyboard input, cursor movement, and basic editing
 */
export function TextInput({
  initialValue = '',
  placeholder = '',
  onSubmit,
  limit,
  alertLimit,
}: TextInputProps) {
  const [internalValue, setInternalValue] = useState(initialValue);
  // Cursor position (index in the string)
  const [cursorOffset, setCursorOffset] = useState(0);

  // Update cursor if value changes externally and cursor is out of bounds
  useEffect(() => {
    if (cursorOffset > internalValue.length) {
      setCursorOffset(internalValue.length);
    }
  }, [internalValue, cursorOffset]);

  useInput((input, key) => {
    if (key.return && onSubmit) {
      onSubmit(internalValue);
      return;
    }

    // Backspace: remove character before cursor
    if ((key.backspace || key.delete) && cursorOffset > 0) {
      const nextValue =
        internalValue.slice(0, cursorOffset - 1) + internalValue.slice(cursorOffset);
      setInternalValue(nextValue);
      setCursorOffset(cursorOffset - 1);
      return;
    }

    if (key.leftArrow) {
      setCursorOffset(Math.max(0, cursorOffset - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorOffset(Math.min(internalValue.length, cursorOffset + 1));
      return;
    }

    // Ignore other control keys
    if (key.ctrl || key.meta) {
      return;
    }

    // Insert character
    const sanitized = input.replace(/[\r\n\t]/g, '');
    if (!sanitized) return;

    let nextValue =
      internalValue.slice(0, cursorOffset) + sanitized + internalValue.slice(cursorOffset);

    // Truncate if limit exceeded
    if (limit && nextValue.length > limit) {
      nextValue = nextValue.slice(0, limit);
    }

    setInternalValue(nextValue);

    // Move cursor forward, but ensure it doesn't exceed new value length
    setCursorOffset(Math.min(nextValue.length, cursorOffset + sanitized.length));
  });

  return (
    <CharactersLeft current={internalValue.length} limit={limit} alertLimit={alertLimit}>
      <Text>
        {text.value(internalValue.slice(0, cursorOffset))}
        {cursorOffset === internalValue.length ? (
          <Text inverse color="magenta">
            {' '}
          </Text>
        ) : (
          <Text inverse color="magenta">
            {internalValue[cursorOffset]}
          </Text>
        )}
        {!internalValue && placeholder ? (
          <Text color="gray">{placeholder}</Text>
        ) : (
          text.value(internalValue.slice(cursorOffset + 1))
        )}
      </Text>
    </CharactersLeft>
  );
}

interface CharactersLeftProps extends Pick<TextInputProps, 'limit' | 'alertLimit'> {
  current: number;
  children?: React.ReactNode;
}

function CharactersLeft({ current, limit, alertLimit = 15, children }: CharactersLeftProps) {
  if (!limit) {
    return <Box flexDirection="column">{children}</Box>;
  }

  return (
    <Box flexDirection="column">
      {children}
      <Box marginTop={1}>
        <Text>
          {text.hint('Characters: ')}
          {current > limit - alertLimit
            ? text.warning(`${current}/${limit}`)
            : text.success(`${current}/${limit}`)}
        </Text>
      </Box>
    </Box>
  );
}
