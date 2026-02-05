import { text } from '../styles';
import React, { useEffect, useState } from 'react';
import { Text, useInput } from 'ink';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  limit?: number;
}

/**
 * Custom Text Input component
 * Handles keyboard input, cursor movement, and basic editing
 */
export function TextInput({ value, onChange, onSubmit, placeholder = '', limit }: TextInputProps) {
  // Cursor position (index in the string)
  const [cursorOffset, setCursorOffset] = useState(0);

  // Update cursor if value changes externally and cursor is out of bounds
  useEffect(() => {
    if (cursorOffset > value.length) {
      setCursorOffset(value.length);
    }
  }, [value, cursorOffset]);

  useInput((input, key) => {
    if (key.return) {
      if (onSubmit) {
        onSubmit(value);
      }
      return;
    }

    // Backspace: remove character before cursor
    if (key.backspace || key.delete) {
      if (cursorOffset > 0) {
        const nextValue = value.slice(0, cursorOffset - 1) + value.slice(cursorOffset);
        onChange(nextValue);
        setCursorOffset(cursorOffset - 1);
      }
      return;
    }

    if (key.leftArrow) {
      setCursorOffset(Math.max(0, cursorOffset - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorOffset(Math.min(value.length, cursorOffset + 1));
      return;
    }

    // Ignore other control keys
    if (key.ctrl || key.meta) {
      return;
    }

    // Insert character
    const nextValue = value.slice(0, cursorOffset) + input + value.slice(cursorOffset);
    if (limit && nextValue.length - 1 >= limit) return;

    onChange(nextValue);
    setCursorOffset(cursorOffset + 1);
  });

  // If empty, show placeholder
  if (!value && placeholder) {
    return <Text color="gray">{placeholder}</Text>;
  }

  // Render text with cursor
  // If we are at the end of the string, append a cursor block
  if (cursorOffset === value.length) {
    return (
      <Text>
        {text.value(value)}
        <Text inverse color="magenta">
          {' '}
        </Text>
      </Text>
    );
  }

  const beforeCursor = value.slice(0, cursorOffset);
  const atCursor = value[cursorOffset];
  const afterCursor = value.slice(cursorOffset + 1);

  return (
    <Text>
      {text.value(beforeCursor)}
      <Text inverse color="magenta">
        {atCursor}
      </Text>
      {text.value(afterCursor)}
    </Text>
  );
}
