import { access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  formatDatabaseTarget,
  formatStartupFailure,
  getNodeEnvironment,
  parseDatabaseUrl,
  parsePort,
  readRequiredEnv,
} from '../../../scripts/startup-runtime.mjs';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const entrypoint = path.join(appDir, '..', 'dist', 'main.js');

function assertApiRuntimeEnvironment() {
  const databaseUrl = parseDatabaseUrl(readRequiredEnv(process.env, 'DATABASE_URL', 'api'));
  const environment = getNodeEnvironment(process.env);

  const jwtSecret = readRequiredEnv(process.env, 'JWT_SECRET', 'api');
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }

  const bootstrapSecret = process.env['AUTH_BOOTSTRAP_SECRET']?.trim();
  if (bootstrapSecret && bootstrapSecret.length < 8) {
    throw new Error('AUTH_BOOTSTRAP_SECRET must be at least 8 characters when set.');
  }

  const port = parsePort(process.env, 4000);

  return {
    databaseUrl,
    environment,
    port,
  };
}

async function main() {
  await access(entrypoint).catch(() => {
    throw new Error(
      `Expected compiled API entrypoint at ${entrypoint}. Run "pnpm --filter @naval/api build" before starting production mode.`,
    );
  });

  const runtimeConfig = assertApiRuntimeEnvironment();
  console.log(
    `[api] Startup checks passed ${JSON.stringify({
      environment: runtimeConfig.environment,
      port: runtimeConfig.port,
      databaseTarget: formatDatabaseTarget(runtimeConfig.databaseUrl),
      bootstrapAuthEnabled: Boolean(process.env['AUTH_BOOTSTRAP_SECRET']?.trim()),
      healthPaths: {
        status: '/api/v1/health',
        live: '/api/v1/health/live',
        ready: '/api/v1/health/ready',
      },
    })}`,
  );

  const child = spawn(process.execPath, [entrypoint], {
    stdio: 'inherit',
    env: process.env,
  });

  const forwardSignal = (signal) => {
    if (!child.killed && child.exitCode === null) {
      child.kill(signal);
    }
  };
  process.once('SIGINT', () => forwardSignal('SIGINT'));
  process.once('SIGTERM', () => forwardSignal('SIGTERM'));

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(formatStartupFailure('api', error));
  process.exit(1);
});
