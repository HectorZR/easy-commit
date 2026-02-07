import { Box, Text, useInput } from 'ink';
import React, { useEffect, useReducer } from 'react';
import { text } from '../styles';
import { textareaReducer } from './reducers/textarea-reducer';

interface TextareaInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  width?: number;
  height?: number;
  limit?: number;
}

/**
 * Textarea Input component with hard wrap and arrow indicator
 */
export function TextareaInput({
  value,
  onChange,
  onSubmit,
  placeholder = '',
  width = 50,
  height = 5,
  limit,
}: TextareaInputProps) {
  // Use reducer for state management
  const [state, dispatch] = useReducer(textareaReducer, {
    lines: value.split('\n'),
    cursor: { line: 0, column: 0 },
  });

  // Sync internal state when prop value changes externally
  // We compare joined lines to avoid loop if object ref differs but content is same
  useEffect(() => {
    const currentVal = state.lines.join('\n');
    if (value !== currentVal) {
      dispatch({ type: 'SYNC_VALUE', value });
    }
  }, [value, state.lines]);

  useInput((input, key) => {
    // Ctrl+D for submit
    if (key.ctrl && input === 'd') {
      onSubmit?.(value);
      return;
    }

    // Enter for new line
    if (key.return) {
      const newLineAction = { type: 'NEW_LINE', limit } as const;
      const newState = textareaReducer(state, newLineAction);
      
      // We manually check if we should apply the change to notify parent
      // because dispatch is async-like regarding render cycle, but we need
      // to call onChange with the NEW value immediately for controlled components
      if (newState.lines !== state.lines) {
        onChange(newState.lines.join('\n'));
      }
      dispatch(newLineAction);
      return;
    }

    // Backspace / Delete
    if (key.backspace || key.delete) {
      const actionType = key.delete ? 'DELETE_AFTER' : 'DELETE_BEFORE';
      const action = { type: actionType } as const;
      
      const newState = textareaReducer(state, action);
      if (newState.lines !== state.lines) {
        onChange(newState.lines.join('\n'));
      }
      dispatch(action);
      return;
    }

    // Navigation
    if (key.leftArrow) { dispatch({ type: 'NAVIGATE', direction: 'LEFT' }); return; }
    if (key.rightArrow) { dispatch({ type: 'NAVIGATE', direction: 'RIGHT' }); return; }
    if (key.upArrow) { dispatch({ type: 'NAVIGATE', direction: 'UP' }); return; }
    if (key.downArrow) { dispatch({ type: 'NAVIGATE', direction: 'DOWN' }); return; }
    if (key.home) { dispatch({ type: 'NAVIGATE', direction: 'HOME' }); return; }
    if (key.end) { dispatch({ type: 'NAVIGATE', direction: 'END' }); return; }

    if (key.ctrl || key.meta) return;

    // Insert character
    const insertAction = { type: 'INSERT', char: input, width, limit } as const;
    const newState = textareaReducer(state, insertAction);
    if (newState.lines !== state.lines) {
        onChange(newState.lines.join('\n'));
    }
    dispatch(insertAction);
  });

  // Render logic
  const { lines, cursor } = state;
  const visibleStart = Math.max(0, cursor.line - height + 1);
  const visibleLines = lines.slice(visibleStart, visibleStart + height);
  
  // Fill empty space
  while (visibleLines.length < height) {
    visibleLines.push('');
  }

  // Placeholder state
  if (!value && placeholder) {
    return (
      <Box flexDirection="column">
        {Array.from({ length: height }).map((_, i) => (
          <Box key={i}>
            <Text color="magentaBright">{'→'} </Text>
            {i === 0 ? <Text color="gray">{placeholder}</Text> : <Text>{''}</Text>}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {visibleLines.map((line, index) => {
        const lineIndex = visibleStart + index;
        const isCurrentLine = lineIndex === cursor.line;

        if (!isCurrentLine) {
          return (
            <Box key={lineIndex}>
              <Text color="gray">{'  '} </Text>
              <Text>{text.value(line)}</Text>
            </Box>
          );
        }

        const beforeCursor = line.slice(0, cursor.column);
        const atCursor = line[cursor.column] || ' ';
        const afterCursor = line.slice(cursor.column + 1);

        return (
          <Box key={lineIndex}>
            <Text color="magentaBright">{'→'} </Text>
            <Text>
              {text.value(beforeCursor)}
              <Text inverse color="magenta">
                {atCursor}
              </Text>
              {text.value(afterCursor)}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

export default TextareaInput;
