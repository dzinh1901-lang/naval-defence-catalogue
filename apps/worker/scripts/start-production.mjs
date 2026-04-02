import { access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  formatDatabaseTarget,
  formatStartupFailure,
  getNodeEnvironment,
  parseDatabaseUrl,
  readOptionalReadyFile,
  readRequiredEnv,
} from '../../../scripts/startup-runtime.mjs';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const entrypoint = path.join(appDir, '..', 'dist', 'index.js');

async function main() {
  await access(entrypoint).catch(() => {
    throw new Error(
      `Expected compiled worker entrypoint at ${entrypoint}. Run "pnpm --filter @naval/worker build" before starting production mode.`,
    );
  });

  const environment = getNodeEnvironment(process.env);
  const databaseUrl = parseDatabaseUrl(readRequiredEnv(process.env, 'DATABASE_URL', 'worker'));
  const readyFile = readOptionalReadyFile(process.env);
  console.log(
    `[worker] Startup checks passed ${JSON.stringify({
      environment,
      databaseTarget: formatDatabaseTarget(databaseUrl),
      readyFile: readyFile ?? 'disabled',
    })}`,
  );

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
  console.error(formatStartupFailure('worker', error));
  process.exit(1);
});
