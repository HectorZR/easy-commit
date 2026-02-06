import { describe, expect, test } from 'bun:test';
import { render } from 'ink-testing-library';
import React from 'react';
import {
  ErrorMessage,
  ValidationMessage,
} from '../../../../src/infrastructure/ui/components/ErrorMessage';
import { CustomFooter, Footer } from '../../../../src/infrastructure/ui/components/Footer';
import { Header } from '../../../../src/infrastructure/ui/components/Header';
import { ProgressBar } from '../../../../src/infrastructure/ui/components/ProgressBar';

describe('UI Components', () => {
  describe('Header', () => {
    test('should render title', () => {
      const { lastFrame } = render(<Header title="Test Title" />);
      const output = lastFrame();

      expect(output).toContain('Test Title');
    });

    test('should render subtitle when provided', () => {
      const { lastFrame } = render(<Header title="Title" subtitle="Subtitle text" />);
      const output = lastFrame();

      expect(output).toContain('Title');
      expect(output).toContain('Subtitle text');
    });

    test('should not render subtitle when not provided', () => {
      const { lastFrame } = render(<Header title="Just Title" />);
      const output = lastFrame();

      expect(output).toContain('Just Title');
      // Subtitle should not be present
      const lines = output?.split('\n') || [];
      expect(lines.length).toBeLessThan(5); // Just title and spacing
    });
  });

  describe('Footer', () => {
    test('should render navigation hints', () => {
      const { lastFrame } = render(<Footer />);
      const output = lastFrame();

      expect(output).toContain('arrows');
      expect(output).toContain('Enter');
      expect(output).toContain('Ctrl+C');
    });
  });

  describe('CustomFooter', () => {
    test('should render custom hints', () => {
      const hints = ['Press Enter to continue', 'Press Esc to cancel'];
      const { lastFrame } = render(<CustomFooter hints={hints} />);
      const output = lastFrame();

      expect(output).toContain('Press Enter to continue');
      expect(output).toContain('Press Esc to cancel');
    });

    test('should render multiple hints', () => {
      const hints = ['Hint 1', 'Hint 2', 'Hint 3'];
      const { lastFrame } = render(<CustomFooter hints={hints} />);
      const output = lastFrame();

      for (const hint of hints) {
        expect(output).toContain(hint);
      }
    });
  });

  describe('ProgressBar', () => {
    test('should show current step and total', () => {
      const { lastFrame } = render(<ProgressBar current={3} total={5} />);
      const output = lastFrame();

      expect(output).toContain('3/7');
    });

    test('should show progress at start', () => {
      const { lastFrame } = render(<ProgressBar current={1} total={5} />);
      const output = lastFrame();

      expect(output).toContain('1/7');
    });

    test('should show progress at end', () => {
      const { lastFrame } = render(<ProgressBar current={7} total={5} />);
      const output = lastFrame();

      expect(output).toContain('7/7');
    });
  });

  describe('ErrorMessage', () => {
    test('should render error message', () => {
      const { lastFrame } = render(<ErrorMessage message="Something went wrong" />);
      const output = lastFrame();

      expect(output).toContain('Something went wrong');
      expect(output).toContain('✗'); // Error icon
    });
  });

  describe('ValidationMessage', () => {
    test('should not render when no errors', () => {
      const { lastFrame } = render(<ValidationMessage errors={[]} />);
      const output = lastFrame();

      expect(output).toBe('');
    });

    test('should render single error', () => {
      const { lastFrame } = render(<ValidationMessage errors={['Error 1']} />);
      const output = lastFrame();

      expect(output).toContain('Error 1');
    });

    test('should render multiple errors', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const { lastFrame } = render(<ValidationMessage errors={errors} />);
      const output = lastFrame();

      for (const error of errors) {
        expect(output).toContain(error);
      }
    });
  });
});
