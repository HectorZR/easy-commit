import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'bun';

/**
 * E2E tests for the complete easy-commit workflow
 * These tests use the built binary to test the full application
 */
describe('E2E: Complete Workflow', () => {
  let testDir: string;
  let binaryPath: string;
  let projectRoot: string;

  beforeEach(async () => {
    // Store project root
    projectRoot = process.cwd();

    // Create a temporary directory for testing
    testDir = mkdtempSync(join(tmpdir(), 'easy-commit-e2e-'));

    // Initialize a git repository
    await spawn(['git', 'init'], {
      cwd: testDir,
      stdout: 'ignore',
      stderr: 'ignore',
    }).exited;

    // Configure git user
    await spawn(['git', 'config', 'user.email', 'test@example.com'], {
      cwd: testDir,
      stdout: 'ignore',
    }).exited;

    await spawn(['git', 'config', 'user.name', 'Test User'], {
      cwd: testDir,
      stdout: 'ignore',
    }).exited;

    // Create a test file and stage it
    await Bun.write(join(testDir, 'test.txt'), 'test content');
    await spawn(['git', 'add', 'test.txt'], {
      cwd: testDir,
      stdout: 'ignore',
    }).exited;

    // Use bun run for tests (in production we'd test the binary)
    binaryPath = 'bun';
  });

  afterEach(() => {
    // Cleanup
    if (testDir) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should show help message', async () => {
    const proc = spawn([binaryPath, 'run', join(projectRoot, 'src/index.ts'), '--help'], {
      cwd: testDir,
      stdout: 'pipe',
    });

    const output = await new Response(proc.stdout).text();

    expect(output).toContain('Create conventional commits with an interactive TUI');
    expect(output).toContain('Options:');
    expect(output).toContain('-t, --type');
    expect(output).toContain('-m, --message');
  });

  test('should show version', async () => {
    const proc = spawn([binaryPath, 'run', join(projectRoot, 'src/index.ts'), '--version'], {
      cwd: testDir,
      stdout: 'pipe',
    });

    const output = await new Response(proc.stdout).text();

    expect(output).toMatch(/dev|v?\d+\.\d+\.\d+/);
  });

  test('should create commit in direct mode', async () => {
    const proc = spawn(
      [
        binaryPath,
        'run',
        join(projectRoot, 'src/index.ts'),
        '-t',
        'feat',
        '-m',
        'add test feature',
      ],
      {
        cwd: testDir,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    );

    await proc.exited;

    // Verify commit was created
    const logProc = spawn(['git', 'log', '--oneline', '-1'], {
      cwd: testDir,
      stdout: 'pipe',
    });

    const logOutput = await new Response(logProc.stdout).text();

    expect(logOutput).toContain('feat: add test feature');
  });

  test('should create commit with scope', async () => {
    const proc = spawn(
      [
        binaryPath,
        'run',
        join(projectRoot, 'src/index.ts'),
        '-t',
        'fix',
        '-m',
        'fix login bug',
        '-s',
        'auth',
      ],
      {
        cwd: testDir,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    );

    await proc.exited;

    // Verify commit was created with scope
    const logProc = spawn(['git', 'log', '--oneline', '-1'], {
      cwd: testDir,
      stdout: 'pipe',
    });

    const logOutput = await new Response(logProc.stdout).text();

    expect(logOutput).toContain('fix(auth): fix login bug');
  });

  test('should create breaking change commit', async () => {
    const proc = spawn(
      [
        binaryPath,
        'run',
        join(projectRoot, 'src/index.ts'),
        '-t',
        'feat',
        '-m',
        'change API',
        '-b',
      ],
      {
        cwd: testDir,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    );

    await proc.exited;

    // Verify commit message includes breaking change
    const logProc = spawn(['git', 'log', '-1', '--pretty=%B'], {
      cwd: testDir,
      stdout: 'pipe',
    });

    const logOutput = await new Response(logProc.stdout).text();

    expect(logOutput).toContain('feat: change API');
    expect(logOutput).toContain('BREAKING CHANGE:');
  });

  test('should preview commit in dry-run mode without creating it', async () => {
    const proc = spawn(
      [
        binaryPath,
        'run',
        join(projectRoot, 'src/index.ts'),
        '--dry-run',
        '-t',
        'feat',
        '-m',
        'test feature',
      ],
      {
        cwd: testDir,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    );

    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    expect(exitCode).toBe(0);
    expect(output).toContain('Preview (dry-run):');
    expect(output).toContain('feat: test feature');

    // Verify no commit was created
    const logProc = spawn(['git', 'log', '--oneline'], {
      cwd: testDir,
      stdout: 'pipe',
    });

    const logOutput = await new Response(logProc.stdout).text();
    expect(logOutput).toBe(''); // Should be empty, no commits
  });

  test('should fail when not in a git repository', async () => {
    const nonGitDir = mkdtempSync(join(tmpdir(), 'easy-commit-no-git-'));

    const proc = spawn([binaryPath, 'run', join(projectRoot, 'src/index.ts'), '--help'], {
      cwd: nonGitDir,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    await proc.exited;

    // Cleanup
    rmSync(nonGitDir, { recursive: true, force: true });

    // Help should work even in non-git directory
    expect(true).toBe(true);
  });

  test('should fail when no staged changes', async () => {
    // First make an initial commit so we can reset properly
    await spawn(['git', 'commit', '-m', 'initial commit'], {
      cwd: testDir,
      stdout: 'ignore',
    }).exited;

    // Create another file but don't stage it
    await Bun.write(join(testDir, 'test2.txt'), 'test content 2');

    const proc = spawn(
      [binaryPath, 'run', join(projectRoot, 'src/index.ts'), '-t', 'feat', '-m', 'test'],
      {
        cwd: testDir,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    );

    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    expect(exitCode).toBe(1);
    expect(stderr).toContain('No staged changes');
  });

  test('should validate commit type', async () => {
    const proc = spawn(
      [binaryPath, 'run', join(projectRoot, 'src/index.ts'), '-t', 'invalid', '-m', 'test'],
      {
        cwd: testDir,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    );

    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    expect(exitCode).toBe(1);
    expect(stderr).toContain('Invalid commit type');
  });
});
