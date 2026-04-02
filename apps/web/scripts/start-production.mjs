import { access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const entrypoint = path.join(appDir, '..', '.next', 'standalone', 'apps', 'web', 'server.js');
const serviceAuthFields = [
  'AUTH_BOOTSTRAP_SECRET',
  'API_SERVICE_USER_ID',
  'API_SERVICE_EMAIL',
  'API_SERVICE_ORGANIZATION_ID',
  'API_SERVICE_ROLE',
];

function readConfiguredEnv(name) {
  return process.env[name]?.trim();
}

function readRequiredEnv(name) {
  const value = readConfiguredEnv(name);
  if (!value) {
    throw new Error(`${name} must be set before starting the web app in production mode.`);
  }

  return value;
}

function assertWebRuntimeEnvironment() {
  readRequiredEnv('API_URL');
  readRequiredEnv('NEXT_PUBLIC_API_URL');

  if (readConfiguredEnv('NEXT_PUBLIC_API_AUTH_TOKEN')) {
    throw new Error(
      'NEXT_PUBLIC_API_AUTH_TOKEN is no longer supported. Use API_AUTH_TOKEN or AUTH_BOOTSTRAP_SECRET + API_SERVICE_* for server-side API access.',
    );
  }

  const apiAuthToken = readConfiguredEnv('API_AUTH_TOKEN');
  const configuredBootstrapFields = serviceAuthFields.filter((name) => readConfiguredEnv(name));

  if (configuredBootstrapFields.length > 0 && configuredBootstrapFields.length !== serviceAuthFields.length) {
    throw new Error(
      `To bootstrap a server-side API token, set all of ${serviceAuthFields.join(', ')} together.`,
    );
  }

  if (!apiAuthToken && configuredBootstrapFields.length !== serviceAuthFields.length) {
    throw new Error(
      'Configure API_AUTH_TOKEN or AUTH_BOOTSTRAP_SECRET + API_SERVICE_* before starting the web app in production mode.',
    );
  }
}

async function main() {
  await access(entrypoint).catch(() => {
    throw new Error(
      `Expected compiled web entrypoint at ${entrypoint}. Run "pnpm --filter @naval/web build" before starting production mode.`,
    );
  });

  assertWebRuntimeEnvironment();

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
