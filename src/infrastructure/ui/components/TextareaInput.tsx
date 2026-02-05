import { Box, Text, useInput } from 'ink';
import React, { useEffect, useState } from 'react';
import { text } from '../styles';

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
  // Cursor position (line and column)
  const [cursor, setCursor] = useState({ line: 0, column: 0 });

  // Split value into lines
  const lines = value.split('\n');

  // Ensure cursor stays within bounds when value changes externally
  useEffect(() => {
    const maxLine = Math.max(0, lines.length - 1);
    const maxColumn = lines[cursor.line]?.length || 0;

    if (cursor.line > maxLine) {
      setCursor({ line: maxLine, column: maxColumn });
    } else if (cursor.column > maxColumn) {
      setCursor({ line: cursor.line, column: maxColumn });
    }
  }, [cursor.line, cursor.column, lines]);

  // Hard wrap: split a line at width boundary
  const hardWrapLine = (line: string): string[] => {
    if (line.length <= width) return [line];

    const result: string[] = [];
    let remaining = line;

    while (remaining.length > width) {
      // Try to break at word boundary
      let breakPoint = width;

      // Look for a space to break at (word wrap)
      while (breakPoint > 0 && remaining[breakPoint] !== ' ') {
        breakPoint--;
      }

      // If no space found, break at width (hard break)
      if (breakPoint === 0) {
        breakPoint = width;
      }

      result.push(remaining.slice(0, breakPoint));
      remaining = remaining.slice(breakPoint).trimStart();
    }

    if (remaining.length > 0) {
      result.push(remaining);
    }

    return result;
  };

  // Insert character at cursor position with hard wrap
  const insertChar = (char: string) => {
    const currentLines = value.split('\n');
    const currentLine = currentLines[cursor.line] || '';
    const before = currentLine.slice(0, cursor.column);
    const after = currentLine.slice(cursor.column);
    const newLine = before + char + after;

    // Check limit
    if (limit && value.length >= limit) {
      return;
    }

    // Apply hard wrap if line exceeds width
    const wrappedLines = hardWrapLine(newLine);

    if (wrappedLines.length > 1) {
      // Line was wrapped
      const newLines = [...currentLines];
      newLines.splice(cursor.line, 1, ...wrappedLines);
      onChange(newLines.join('\n'));

      // Move cursor to end of first wrapped line or start of next
      if (cursor.column + 1 > wrappedLines[0].length) {
        setCursor({
          line: cursor.line + 1,
          column: cursor.column + 1 - wrappedLines[0].length,
        });
      } else {
        setCursor({
          line: cursor.line,
          column: cursor.column + 1,
        });
      }
    } else {
      // No wrap needed
      const newLines = [...currentLines];
      newLines[cursor.line] = newLine;
      onChange(newLines.join('\n'));
      setCursor({ line: cursor.line, column: cursor.column + 1 });
    }
  };

  // Delete character before cursor (Backspace)
  const deleteBefore = () => {
    const currentLines = value.split('\n');

    if (cursor.column > 0) {
      // Delete within line
      const currentLine = currentLines[cursor.line];
      const newLine = currentLine.slice(0, cursor.column - 1) + currentLine.slice(cursor.column);
      const newLines = [...currentLines];
      newLines[cursor.line] = newLine;
      onChange(newLines.join('\n'));
      setCursor({ line: cursor.line, column: cursor.column - 1 });
    } else if (cursor.line > 0) {
      // Join with previous line
      const prevLine = currentLines[cursor.line - 1];
      const currentLine = currentLines[cursor.line];
      const newLine = prevLine + currentLine;
      const newLines = [...currentLines];
      newLines.splice(cursor.line - 1, 2, newLine);
      onChange(newLines.join('\n'));
      setCursor({ line: cursor.line - 1, column: prevLine.length });
    }
  };

  // Delete character after cursor (Delete key)
  const deleteAfter = () => {
    const currentLines = value.split('\n');
    const currentLine = currentLines[cursor.line];

    if (cursor.column < currentLine.length) {
      // Delete within line
      const newLine = currentLine.slice(0, cursor.column) + currentLine.slice(cursor.column + 1);
      const newLines = [...currentLines];
      newLines[cursor.line] = newLine;
      onChange(newLines.join('\n'));
    } else if (cursor.line < currentLines.length - 1) {
      // Join with next line
      const nextLine = currentLines[cursor.line + 1];
      const newLine = currentLine + nextLine;
      const newLines = [...currentLines];
      newLines.splice(cursor.line, 2, newLine);
      onChange(newLines.join('\n'));
    }
  };

  // Insert new line
  const insertNewLine = () => {
    const currentLines = value.split('\n');
    const currentLine = currentLines[cursor.line] || '';
    const before = currentLine.slice(0, cursor.column);
    const after = currentLine.slice(cursor.column);

    const newLines = [...currentLines];
    newLines[cursor.line] = before;
    newLines.splice(cursor.line + 1, 0, after);

    onChange(newLines.join('\n'));
    setCursor({ line: cursor.line + 1, column: 0 });
  };

  useInput((input, key) => {
    // Ctrl+D for submit
    if (key.ctrl && input === 'd') {
      if (onSubmit) {
        onSubmit(value);
      }
      return;
    }

    // Enter for new line
    if (key.return) {
      insertNewLine();
      return;
    }

    // Backspace
    if (key.backspace || key.delete) {
      if (key.delete) {
        deleteBefore();
      } else {
        deleteAfter();
      }
      return;
    }

    // Arrow keys
    if (key.leftArrow) {
      if (cursor.column > 0) {
        setCursor({ ...cursor, column: cursor.column - 1 });
      } else if (cursor.line > 0) {
        const prevLine = lines[cursor.line - 1];
        setCursor({
          line: cursor.line - 1,
          column: prevLine.length,
        });
      }
      return;
    }

    if (key.rightArrow) {
      const currentLine = lines[cursor.line] || '';
      if (cursor.column < currentLine.length) {
        setCursor({ ...cursor, column: cursor.column + 1 });
      } else if (cursor.line < lines.length - 1) {
        setCursor({
          line: cursor.line + 1,
          column: 0,
        });
      }
      return;
    }

    if (key.upArrow) {
      if (cursor.line > 0) {
        const prevLine = lines[cursor.line - 1];
        setCursor({
          line: cursor.line - 1,
          column: Math.min(cursor.column, prevLine.length),
        });
      }
      return;
    }

    if (key.downArrow) {
      if (cursor.line < lines.length - 1) {
        const nextLine = lines[cursor.line + 1];
        setCursor({
          line: cursor.line + 1,
          column: Math.min(cursor.column, nextLine.length),
        });
      }
      return;
    }

    // Home key
    if (key.home) {
      setCursor({ ...cursor, column: 0 });
      return;
    }

    // End key
    if (key.end) {
      const currentLine = lines[cursor.line] || '';
      setCursor({ ...cursor, column: currentLine.length });
      return;
    }

    // Ignore other control keys
    if (key.ctrl || key.meta) {
      return;
    }

    // Insert regular character
    insertChar(input);
  });

  // Render line with cursor
  const renderLine = (line: string, lineIndex: number) => {
    const isCurrentLine = lineIndex === cursor.line;

    if (!isCurrentLine) {
      return (
        <Box key={lineIndex}>
          <Text color="gray">{'  '} </Text>
          <Text>{text.value(line)}</Text>
        </Box>
      );
    }

    // Current line with cursor
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
  };

  // Calculate visible lines (for scrolling)
  const visibleStart = Math.max(0, cursor.line - height + 1);
  const visibleLines = lines.slice(visibleStart, visibleStart + height);

  // Add empty lines if needed to fill height
  while (visibleLines.length < height) {
    visibleLines.push('');
  }

  // Empty state with placeholder
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
      {visibleLines.map((line, index) => renderLine(line, visibleStart + index))}
    </Box>
  );
}

export default TextareaInput;
