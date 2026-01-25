export class Commit {
  constructor(
    public readonly type: string,
    public readonly description: string,
    public readonly scope?: string,
    public readonly body?: string,
    public readonly breaking: boolean = false
  ) {}

  format(): string {
    const scopePart = this.scope ? `(${this.scope})` : '';
    return `${this.type}${scopePart}: ${this.description}`;
  }
}
