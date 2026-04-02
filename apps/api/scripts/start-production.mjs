import { access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const entrypoint = path.join(appDir, '..', 'dist', 'main.js');

function formatDatabaseTarget(connectionString) {
  const parsed = new URL(connectionString);
  return `${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`;
}

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set before starting the API in production mode.`);
  }

  return value;
}

function assertApiRuntimeEnvironment() {
  readRequiredEnv('DATABASE_URL');

  const jwtSecret = readRequiredEnv('JWT_SECRET');
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }

  const bootstrapSecret = process.env['AUTH_BOOTSTRAP_SECRET']?.trim();
  if (bootstrapSecret && bootstrapSecret.length < 8) {
    throw new Error('AUTH_BOOTSTRAP_SECRET must be at least 8 characters when set.');
  }

  const configuredPort = process.env['PORT']?.trim();
  if (configuredPort) {
    const port = Number(configuredPort);
    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
      throw new Error(`PORT must be an integer between 1 and 65535. Received "${configuredPort}".`);
    }
  }
}

async function main() {
  await access(entrypoint).catch(() => {
    throw new Error(
      `Expected compiled API entrypoint at ${entrypoint}. Run "pnpm --filter @naval/api build" before starting production mode.`,
    );
  });

  assertApiRuntimeEnvironment();
  console.log(
    `[api] Launching production runtime ${JSON.stringify({
      environment: process.env['NODE_ENV'] ?? 'production',
      port: Number(process.env['PORT'] ?? '4000'),
      databaseTarget: formatDatabaseTarget(readRequiredEnv('DATABASE_URL')),
      bootstrapAuthEnabled: Boolean(process.env['AUTH_BOOTSTRAP_SECRET']?.trim()),
      readyUrl: `/api/v1/health/ready`,
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
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
