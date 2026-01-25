import { describe, expect, test, mock } from 'bun:test';
import { render } from 'ink-testing-library';
import React from 'react';
import { TypeSelectionScreen } from '../../../../src/infrastructure/ui/screens/TypeSelectionScreen';
import { DescriptionInputScreen } from '../../../../src/infrastructure/ui/screens/DescriptionInputScreen';
import { Screen, type WizardState } from '../../../../src/infrastructure/ui/types';

describe('TypeSelectionScreen', () => {
  const mockState: WizardState = {
    currentScreen: Screen.TYPE_SELECTION,
    type: '',
    description: '',
    scope: '',
    body: '',
    breaking: false,
  };

  test('should render commit type options', () => {
    const onNext = mock(() => {});
    const onBack = mock(() => {});
    const onCancel = mock(() => {});

    const { lastFrame } = render(
      <TypeSelectionScreen state={mockState} onNext={onNext} onBack={onBack} onCancel={onCancel} />
    );
    const output = lastFrame();

    expect(output).toContain('feat');
    expect(output).toContain('fix');
    expect(output).toContain('docs');
    expect(output).toContain('A new feature');
    expect(output).toContain('A bug fix');
  });

  test('should show title and subtitle', () => {
    const onNext = mock(() => {});
    const onBack = mock(() => {});
    const onCancel = mock(() => {});

    const { lastFrame } = render(
      <TypeSelectionScreen state={mockState} onNext={onNext} onBack={onBack} onCancel={onCancel} />
    );
    const output = lastFrame();

    expect(output).toContain('Commit Type');
    expect(output).toContain('Select the type of change');
  });

  test('should show progress bar', () => {
    const onNext = mock(() => {});
    const onBack = mock(() => {});
    const onCancel = mock(() => {});

    const { lastFrame } = render(
      <TypeSelectionScreen state={mockState} onNext={onNext} onBack={onBack} onCancel={onCancel} />
    );
    const output = lastFrame();

    expect(output).toContain('1/7');
  });
});

describe('DescriptionInputScreen', () => {
  const mockState: WizardState = {
    currentScreen: Screen.DESCRIPTION_INPUT,
    type: 'feat',
    description: '',
    scope: '',
    body: '',
    breaking: false,
  };

  test('should render description input', () => {
    const onNext = mock(() => {});
    const onBack = mock(() => {});
    const onCancel = mock(() => {});

    const { lastFrame } = render(
      <DescriptionInputScreen
        state={mockState}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />
    );
    const output = lastFrame();

    expect(output).toContain('Description');
    expect(output).toContain('feat:');
  });

  test('should show character counter', () => {
    const onNext = mock(() => {});
    const onBack = mock(() => {});
    const onCancel = mock(() => {});

    const { lastFrame } = render(
      <DescriptionInputScreen
        state={mockState}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />
    );
    const output = lastFrame();

    expect(output).toContain('72 characters remaining');
  });

  test('should show progress bar at step 2', () => {
    const onNext = mock(() => {});
    const onBack = mock(() => {});
    const onCancel = mock(() => {});

    const { lastFrame } = render(
      <DescriptionInputScreen
        state={mockState}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />
    );
    const output = lastFrame();

    expect(output).toContain('2/7');
  });

  test('should show keyboard hints', () => {
    const onNext = mock(() => {});
    const onBack = mock(() => {});
    const onCancel = mock(() => {});

    const { lastFrame } = render(
      <DescriptionInputScreen
        state={mockState}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />
    );
    const output = lastFrame();

    expect(output).toContain('Enter to submit');
    expect(output).toContain('Ctrl+B to go back');
    expect(output).toContain('Esc to cancel');
  });

  test('should preserve existing description', () => {
    const stateWithDescription = {
      ...mockState,
      description: 'existing description',
    };

    const onNext = mock(() => {});
    const onBack = mock(() => {});
    const onCancel = mock(() => {});

    const { lastFrame } = render(
      <DescriptionInputScreen
        state={stateWithDescription}
        onNext={onNext}
        onBack={onBack}
        onCancel={onCancel}
      />
    );
    const output = lastFrame();

    // Character counter should reflect existing description
    const remaining = 72 - 'existing description'.length;
    expect(output).toContain(`${remaining} characters remaining`);
  });
});
