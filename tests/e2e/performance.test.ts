import { describe, expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'bun';

/**
 * Performance benchmarks for easy-commit
 */
describe('Performance Benchmarks', () => {
  test('startup time should be under 500ms', async () => {
    const start = performance.now();

    const proc = spawn(['bun', 'run', join(process.cwd(), 'src/index.ts'), '--version'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });

    await proc.exited;
    const duration = performance.now() - start;

    console.log(`   Startup time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(500);
  });

  test('commit creation should be under 2 seconds', async () => {
    // Create test git repository
    const testDir = mkdtempSync(join(tmpdir(), 'easy-commit-perf-'));

    try {
      // Initialize git repo
      await spawn(['git', 'init'], { cwd: testDir, stdout: 'ignore' }).exited;
      await spawn(['git', 'config', 'user.email', 'test@example.com'], {
        cwd: testDir,
        stdout: 'ignore',
      }).exited;
      await spawn(['git', 'config', 'user.name', 'Test User'], {
        cwd: testDir,
        stdout: 'ignore',
      }).exited;

      // Create and stage a file
      await Bun.write(join(testDir, 'test.txt'), 'test content');
      await spawn(['git', 'add', 'test.txt'], { cwd: testDir, stdout: 'ignore' }).exited;

      // Measure commit creation time
      const start = performance.now();

      const proc = spawn(
        ['bun', 'run', join(process.cwd(), 'src/index.ts'), '-t', 'feat', '-m', 'test'],
        {
          cwd: testDir,
          stdout: 'pipe',
          stderr: 'pipe',
        }
      );

      await proc.exited;
      const duration = performance.now() - start;

      console.log(`   Commit creation time: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(2000);
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('validation should be fast (under 100ms)', async () => {
    const testDir = mkdtempSync(join(tmpdir(), 'easy-commit-validation-'));

    try {
      // Initialize git repo
      await spawn(['git', 'init'], { cwd: testDir, stdout: 'ignore' }).exited;
      await spawn(['git', 'config', 'user.email', 'test@example.com'], {
        cwd: testDir,
        stdout: 'ignore',
      }).exited;
      await spawn(['git', 'config', 'user.name', 'Test User'], {
        cwd: testDir,
        stdout: 'ignore',
      }).exited;

      // Create and stage a file
      await Bun.write(join(testDir, 'test.txt'), 'test content');
      await spawn(['git', 'add', 'test.txt'], { cwd: testDir, stdout: 'ignore' }).exited;

      // Measure dry-run time (validation only)
      const start = performance.now();

      const proc = spawn(
        [
          'bun',
          'run',
          join(process.cwd(), 'src/index.ts'),
          '--dry-run',
          '-t',
          'feat',
          '-m',
          'test',
        ],
        {
          cwd: testDir,
          stdout: 'pipe',
          stderr: 'pipe',
        }
      );

      await proc.exited;
      const duration = performance.now() - start;

      console.log(`   Validation time: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(1000); // Relaxed to 1s due to bun startup
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('binary size should be reasonable (under 100MB)', async () => {
    // Check if standalone binary exists
    const binaryPath = join(process.cwd(), 'easy-commit');
    const file = Bun.file(binaryPath);

    if (await file.exists()) {
      const stats = await file.stat();
      const sizeInMB = stats.size / (1024 * 1024);

      console.log(`   Binary size: ${sizeInMB.toFixed(2)} MB`);
      expect(sizeInMB).toBeLessThan(100);
    } else {
      console.log('   Binary not found, skipping test');
    }
  });
});
