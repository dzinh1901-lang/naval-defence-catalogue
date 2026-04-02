import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const rootDir = path.resolve(import.meta.dirname, '..');
const scriptsDir = path.join(rootDir, 'scripts');

async function findTests(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const tests = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      tests.push(...(await findTests(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.test.mjs')) {
      tests.push(fullPath);
    }
  }

  return tests;
}

const tests = (await findTests(scriptsDir))
  .map((file) => path.relative(rootDir, file))
  .sort();

if (tests.length === 0) {
  console.log('No script tests found.');
  process.exit(0);
}

const child = spawn(process.execPath, ['--test', ...tests], {
  cwd: rootDir,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code !== null ? code : 1);
});
