import { describe, expect, mock, test } from 'bun:test';
import { colors, text } from '@infrastructure/ui/styles';
import { render } from 'ink-testing-library';
import React from 'react';
import { DescriptionInputScreen } from '../../../../src/infrastructure/ui/screens/DescriptionInputScreen';
import { TypeSelectionScreen } from '../../../../src/infrastructure/ui/screens/TypeSelectionScreen';
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

    expect(output).toContain('1/5');
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
    expect(output).toContain('Enter a concise description');
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

    expect(output).toContain(text.hint('Characters: '));
    expect(output).toContain(text.success('0/72'));
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

    expect(output).toContain('2/5');
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

    expect(output).toContain('[Enter] Continue');
    expect(output).toContain('[Ctrl+B] Back');
    expect(output).toContain('[Esc] Cancel');
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
    const currentLength = 'existing description'.length;
    expect(output).toContain(text.hint('Characters: '));
    expect(output).toContain(text.success(`${currentLength}/72`));
  });
});
