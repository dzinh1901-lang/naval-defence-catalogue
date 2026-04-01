import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const entrypoint = path.resolve(process.cwd(), 'dist/main.js');
const readyMarker = path.resolve(process.cwd(), 'node_modules/.cache/watch-build.ready');

async function waitForEntrypoint() {
  for (;;) {
    try {
      await access(readyMarker);
      await access(entrypoint);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

async function main() {
  await waitForEntrypoint();

  const child = spawn(process.execPath, [...process.execArgv, '--watch', entrypoint], {
    stdio: 'inherit',
    env: process.env,
  });

  const forwardSignal = (signal) => {
    child.kill(signal);
  };

  process.on('SIGINT', forwardSignal);
  process.on('SIGTERM', forwardSignal);

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
