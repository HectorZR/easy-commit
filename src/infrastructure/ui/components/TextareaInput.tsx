import { Box, Text, useInput } from 'ink';
import { useReducer } from 'react';
import { text } from '../styles';
import { textareaReducer } from './reducers/textarea-reducer';

interface TextareaInputProps {
  initialValue?: string;
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
  initialValue = '',
  onSubmit,
  placeholder = '',
  width = 50,
  height = 5,
  limit,
}: TextareaInputProps) {
  // Use reducer for state management
  const [state, dispatch] = useReducer(textareaReducer, {
    lines: initialValue.split('\n'),
    cursor: { line: 0, column: 0 },
  });

  const { lines, cursor } = state;

  useInput((input, key) => {
    // Ctrl+D for submit
    if (key.ctrl && input === 'd') {
      const finalValue = lines.join('\n');
      onSubmit?.(finalValue);
      return;
    }

    // Enter for new line
    if (key.return) {
      const newLineAction = { type: 'NEW_LINE', limit } as const;
      dispatch(newLineAction);
      return;
    }

    // Backspace / Delete
    if (key.backspace || key.delete) {
      // Treat both as backspace for better compatibility (matches TextInput behavior)
      dispatch({ type: 'DELETE_BEFORE' });
      return;
    }

    // Navigation
    if (key.leftArrow) {
      dispatch({ type: 'NAVIGATE', direction: 'LEFT' });
      return;
    }
    if (key.rightArrow) {
      dispatch({ type: 'NAVIGATE', direction: 'RIGHT' });
      return;
    }
    if (key.upArrow) {
      dispatch({ type: 'NAVIGATE', direction: 'UP' });
      return;
    }
    if (key.downArrow) {
      dispatch({ type: 'NAVIGATE', direction: 'DOWN' });
      return;
    }
    if (key.home) {
      dispatch({ type: 'NAVIGATE', direction: 'HOME' });
      return;
    }
    if (key.end) {
      dispatch({ type: 'NAVIGATE', direction: 'END' });
      return;
    }

    if (key.ctrl || key.meta) return;

    // Insert character
    const insertAction = { type: 'INSERT', char: input, width, limit } as const;
    dispatch(insertAction);
  });

  // Render logic
  const visibleStart = Math.max(0, cursor.line - height + 1);
  const visibleLines = lines.slice(visibleStart, visibleStart + height);

  // Fill empty space
  while (visibleLines.length < height) {
    visibleLines.push('');
  }

  // Placeholder state logic: only if empty content
  const isEmpty = lines.length === 1 && lines[0] === '';
  if (isEmpty && placeholder) {
    return (
      <Box flexDirection="column">
        {Array.from({ length: height }).map((_, i) => (
          <Box key={`line-${String(i)}`}>
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
