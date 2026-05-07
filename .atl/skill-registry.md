# Skill Registry — easy-commit

Generated: 2026-04-26

## Project Conventions

| File | Purpose |
|------|---------|
| `AGENTS.md` | Project overview, architecture, conventions, testing, git workflow, release process |

## User Skills

| Skill | Trigger |
|-------|---------|
| `brainstorming` | Before any creative work — creating features, building components, adding functionality |
| `branch-pr` | When creating a pull request or preparing changes for review |
| `find-skills` | When user asks "how do I do X", "find a skill for X", or wants to extend capabilities |
| `frontend-design` | Build web components, pages, or applications with high design quality |
| `issue-creation` | When creating a GitHub issue, reporting a bug, or requesting a feature |
| `judgment-day` | Adversarial parallel review of implementation or architecture |
| `mcp-builder` | When building MCP servers |
| `skill-creator` | When creating new skills or documenting patterns for AI |
| `skill-registry` | When updating skills, installing/removing skills, or rebuilding registry |
| `solid` | When writing code, implementing features, refactoring, or designing systems |
| `web-design-guidelines` | Review UI code for accessibility and best practices |

## Compact Rules

### solid
- Apply SOLID principles: SRP, OCP, LSP, ISP, DIP
- Prefer composition over inheritance
- Keep functions small and focused (single responsibility)
- Use meaningful names — no abbreviations, no generic names
- Avoid premature abstraction; extract only when pattern repeats 3+ times
- Write tests before or alongside implementation

### brainstorming
- MUST be invoked before creating new features, components, or modifying behavior
- Explores user intent and requirements before implementation begins

### branch-pr
- PR titles: type(scope): description — follow Conventional Commits
- Link to issue in PR body
- Use `bun test` to verify before opening PR

### issue-creation
- Include reproduction steps, expected vs actual behavior
- Label appropriately (bug, feat, chore)

## Code Context Triggers

| File Pattern | Skills |
|-------------|--------|
| `src/**/*.ts`, `src/**/*.tsx` | `solid` |
| `tests/**/*.ts` | `solid` |
| `src/infrastructure/ui/**` | `solid`, `web-design-guidelines` |
| `*.md` | none |
| PR creation | `branch-pr` |
| Issue creation | `issue-creation` |
| New feature planning | `brainstorming` |
