/**
 * Reducer logic for the TextareaInput component
 * Handles all text manipulation and cursor movement logic in a pure, testable way.
 */

export interface Cursor {
  line: number;
  column: number;
}

export interface TextareaState {
  lines: string[];
  cursor: Cursor;
}

export type TextareaAction =
  | { type: 'INSERT'; char: string; width: number; limit?: number }
  | { type: 'DELETE_BEFORE' } // Backspace
  | { type: 'DELETE_AFTER' }  // Delete
  | { type: 'NEW_LINE'; limit?: number }
  | { type: 'NAVIGATE'; direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'HOME' | 'END' };

/**
 * Hard wrap logic: splits a line at the given width boundary
 */
function hardWrapLine(line: string, width: number): string[] {
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
}

/**
 * Reducer function for TextareaInput
 */
export function textareaReducer(state: TextareaState, action: TextareaAction): TextareaState {
  switch (action.type) {
    case 'INSERT': {
      const { char, width, limit } = action;
      
      // Check total length limit
      const currentLength = state.lines.reduce((acc, line) => acc + line.length, 0) + (state.lines.length - 1);
      if (limit && currentLength >= limit) {
        return state;
      }

      const currentLines = [...state.lines];
      // Ensure current line exists
      if (!currentLines[state.cursor.line]) {
        currentLines[state.cursor.line] = '';
      }
      
      const currentLine = currentLines[state.cursor.line];
      const before = currentLine.slice(0, state.cursor.column);
      const after = currentLine.slice(state.cursor.column);
      const newLine = before + char + after;

      // Apply hard wrap
      const wrappedLines = hardWrapLine(newLine, width);

      if (wrappedLines.length > 1) {
        // Line was wrapped
        currentLines.splice(state.cursor.line, 1, ...wrappedLines);
        
        let newCursorLine = state.cursor.line;
        let newCursorCol = state.cursor.column + 1;
        
        // If the insertion point is now in the second line (due to wrap point being before cursor)
        const firstLineLen = wrappedLines[0].length;
        
        if (newCursorCol > firstLineLen) {
           newCursorLine++;
           newCursorCol = newCursorCol - firstLineLen; 
           
           // If wrap created a trimmed line, we must ensure cursor isn't beyond length
           const nextLineLen = wrappedLines[1] ? wrappedLines[1].length : 0;
           if (newCursorCol > nextLineLen) {
              newCursorCol = nextLineLen; 
           }
        }

        return {
          lines: currentLines,
          cursor: {
            line: newCursorLine,
            column: newCursorCol
          }
        };
      } else {
        // No wrap needed
        currentLines[state.cursor.line] = newLine;
        return {
          lines: currentLines,
          cursor: {
            line: state.cursor.line,
            column: state.cursor.column + 1
          }
        };
      }
    }

    case 'DELETE_BEFORE': {
      // Backspace
      const { line, column } = state.cursor;
      const currentLines = [...state.lines];

      if (column > 0) {
        // Delete within line
        const currentLine = currentLines[line];
        const newLine = currentLine.slice(0, column - 1) + currentLine.slice(column);
        currentLines[line] = newLine;
        
        return {
          lines: currentLines,
          cursor: { line, column: column - 1 }
        };
      } else if (line > 0) {
        // Join with previous line
        const prevLine = currentLines[line - 1];
        const currentLine = currentLines[line];
        const combinedLine = prevLine + currentLine; 
        
        currentLines.splice(line - 1, 2, combinedLine);
        
        return {
          lines: currentLines,
          cursor: { line: line - 1, column: prevLine.length }
        };
      }
      return state;
    }

    case 'DELETE_AFTER': {
      // Delete key
      const { line, column } = state.cursor;
      const currentLines = [...state.lines];
      const currentLine = currentLines[line];

      if (column < currentLine.length) {
        const newLine = currentLine.slice(0, column) + currentLine.slice(column + 1);
        currentLines[line] = newLine;
        return {
          ...state,
          lines: currentLines
        };
      } else if (line < currentLines.length - 1) {
        // Join with next
        const nextLine = currentLines[line + 1];
        const combinedLine = currentLine + nextLine;
        currentLines.splice(line, 2, combinedLine);
        return {
          ...state,
          lines: currentLines
        };
      }
      return state;
    }

    case 'NEW_LINE': {
      const { limit } = action;
      // Check limit (1 char for newline)
      const currentLength = state.lines.reduce((acc, line) => acc + line.length, 0) + (state.lines.length - 1);
       if (limit && currentLength + 1 > limit) {
        return state;
      }

      const { line, column } = state.cursor;
      const currentLines = [...state.lines];
      const currentLine = currentLines[line] || '';
      
      const before = currentLine.slice(0, column);
      const after = currentLine.slice(column);

      currentLines[line] = before;
      currentLines.splice(line + 1, 0, after);

      return {
        lines: currentLines,
        cursor: { line: line + 1, column: 0 }
      };
    }

    case 'NAVIGATE': {
      const { direction } = action;
      let { line, column } = state.cursor;
      const lines = state.lines;

      switch (direction) {
        case 'LEFT':
          if (column > 0) {
            column--;
          } else if (line > 0) {
            line--;
            column = lines[line].length;
          }
          break;
        case 'RIGHT':
           const currentLine = lines[line] || '';
           if (column < currentLine.length) {
             column++;
           } else if (line < lines.length - 1) {
             line++;
             column = 0;
           }
           break;
        case 'UP':
          if (line > 0) {
            line--;
            column = Math.min(column, lines[line].length);
          }
          break;
        case 'DOWN':
          if (line < lines.length - 1) {
            line++;
            // Safety check for next line existence
            const nextLine = lines[line + 1] || '';
            column = Math.min(column, nextLine.length);
          }
          break;
        case 'HOME':
          column = 0;
          break;
        case 'END':
          column = lines[line]?.length || 0;
          break;
      }

      return {
        ...state,
        cursor: { line, column }
      };
    }

    default:
      return state;
  }
}
