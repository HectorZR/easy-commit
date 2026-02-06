import { text } from '../styles';
import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface TextInputProps {
  initialValue: string | undefined;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  limit?: number;
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
    const nextValue =
      internalValue.slice(0, cursorOffset) + input + internalValue.slice(cursorOffset);
    if (limit && nextValue.length - 1 >= limit) return;

    setInternalValue(nextValue);
    setCursorOffset(cursorOffset + 1);
  });

  // If empty, show placeholder
  if (!internalValue && placeholder) {
    return (
      <CharactersLeft current={internalValue.length} limit={limit || 999}>
        <Text color="gray">{placeholder}</Text>
      </CharactersLeft>
    );
  }

  // Render text with cursor
  // If we are at the end of the string, append a cursor block
  if (cursorOffset === internalValue.length) {
    return (
      <CharactersLeft current={internalValue.length} limit={limit || 999}>
        <Text>
          {text.value(internalValue)}
          <Text inverse color="magenta">
            {' '}
          </Text>
        </Text>
      </CharactersLeft>
    );
  }

  const beforeCursor = internalValue.slice(0, cursorOffset);
  const atCursor = internalValue[cursorOffset];
  const afterCursor = internalValue.slice(cursorOffset + 1);

  return (
    <CharactersLeft current={internalValue.length} limit={limit || 999}>
      <Text>
        {text.value(beforeCursor)}
        <Text inverse color="magenta">
          {atCursor}
        </Text>
        {text.value(afterCursor)}
      </Text>
    </CharactersLeft>
  );
}

interface CharactersLeftProps {
  current: number;
  limit: number;
  children?: React.ReactNode;
}

function CharactersLeft({ current, limit, children }: CharactersLeftProps) {
  return (
    <Box flexDirection="column">
      {children}
      <Box marginTop={1}>
        <Text>
          {text.hint('Characters: ')}
          {current > limit - 15
            ? text.warning(`${current}/${limit}`)
            : text.success(`${current}/${limit}`)}
        </Text>
      </Box>
    </Box>
  );
}
