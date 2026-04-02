import { access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const entrypoint = path.join(appDir, '..', 'dist', 'index.js');

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set before starting the worker in production mode.`);
  }

  return value;
}

async function main() {
  await access(entrypoint).catch(() => {
    throw new Error(
      `Expected compiled worker entrypoint at ${entrypoint}. Run "pnpm --filter @naval/worker build" before starting production mode.`,
    );
  });

  readRequiredEnv('DATABASE_URL');

  const child = spawn(process.execPath, [entrypoint], {
    stdio: 'inherit',
    env: process.env,
  });

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
