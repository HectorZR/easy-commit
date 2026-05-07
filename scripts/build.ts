#!/usr/bin/env bun
import { $ } from 'bun';

/**
 * Build script that injects version information and creates standalone binary
 */
async function main() {
  console.log('🔨 Building easy-commit...\n');

  // 1. Get version information
  const version = process.env.VERSION || 'dev';
  let commit = 'none';
  try {
    commit = await $`git rev-parse --short HEAD`.text().then((s) => s.trim());
  } catch (_error) {
    console.warn('Warning: Could not get git commit hash');
  }

  const buildDate =
    new Date().toISOString().replace(/[:.]/g, '_').split('T')[0] +
    '_' +
    new Date().toISOString().replace(/[:.]/g, '_').split('T')[1].split('_')[0];
  const builtBy = process.env.BUILT_BY || 'local';

  // 2. Set environment variables for build
  process.env.VERSION = version;
  process.env.COMMIT = commit;
  process.env.BUILD_DATE = buildDate;
  process.env.BUILT_BY = builtBy;

  console.log(`📦 Version:    ${version}`);
  console.log(`🔖 Commit:     ${commit}`);
  console.log(`📅 Build Date: ${buildDate}`);
  console.log(`👤 Built By:   ${builtBy}\n`);

  // 3. Build standalone binary
  console.log('⚡ Compiling standalone binary...');

  const isWindows = process.platform === 'win32';
  const binaryName = isWindows ? 'easy-commit.exe' : 'easy-commit';

  try {
    await $`bun build src/index.ts --compile --outfile ${binaryName}`.env({
      VERSION: version,
      COMMIT: commit,
      BUILD_DATE: buildDate,
      BUILT_BY: builtBy,
    });
    console.log('✅ Build complete!\n');

    // 4. Sign binary (required on macOS Apple Silicon)
    if (process.platform === 'darwin') {
      console.log('🔐 Signing binary (ad-hoc)...');
      await $`xattr -cr ${binaryName}`;
      await $`codesign --sign - --force ${binaryName}`;
      console.log('✅ Binary signed\n');
    }

    // 5. Show binary info
    const stats = await Bun.file(binaryName).stat();
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`📊 Binary size: ${sizeInMB} MB`);
    console.log(`📁 Output: ./${binaryName}\n`);

    // 6. Test the binary
    console.log('🧪 Testing binary...');
    const testResult = await $`./${binaryName} --version`.text();
    console.log(`   Version output: ${testResult.trim()}`);
    console.log('\n🎉 Build successful!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

main();
