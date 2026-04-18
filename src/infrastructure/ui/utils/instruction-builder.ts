export class InstructionBuilder {
  steps: string[];

  constructor() {
    this.steps = [];
  }

  format() {
    return this.steps.join('  ');
  }

  getSteps() {
    return this.steps;
  }

  addNavigation() {
    this.steps.push('[j/k] [↑/↓] Select');
    return this;
  }

  addConfirmation() {
    this.steps.push('[Enter] Continue');
    return this;
  }

  addBack() {
    this.steps.push('[Ctrl+B] Back');
    return this;
  }

  addCancel() {
    this.steps.push('[Esc] Cancel');
    return this;
  }

  addQuit() {
    this.steps.push('[q] Quit');
    return this;
  }

  addCustomHint(hint: string) {
    this.steps.push(hint);
    return this;
  }
}
