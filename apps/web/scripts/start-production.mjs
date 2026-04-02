import { access } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  describeHttpEndpoint,
  formatStartupFailure,
  getNodeEnvironment,
  parsePort,
  readRequiredEnv,
  validateWebAuthConfig,
} from '../../../scripts/startup-runtime.mjs';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const entrypoint = path.join(appDir, '..', '.next', 'standalone', 'apps', 'web', 'server.js');

function assertWebRuntimeEnvironment() {
  const environment = getNodeEnvironment(process.env);
  const apiUrl = describeHttpEndpoint(
    'API_URL',
    readRequiredEnv(process.env, 'API_URL', 'web'),
  );
  const publicApiUrl = describeHttpEndpoint(
    'NEXT_PUBLIC_API_URL',
    readRequiredEnv(process.env, 'NEXT_PUBLIC_API_URL', 'web'),
    { publicEndpoint: true },
  );

  if (process.env['NEXT_PUBLIC_API_AUTH_TOKEN']?.trim()) {
    throw new Error(
      'NEXT_PUBLIC_API_AUTH_TOKEN is no longer supported. Use API_AUTH_TOKEN or AUTH_BOOTSTRAP_SECRET + API_SERVICE_* for server-side API access.',
    );
  }

  const authMode = validateWebAuthConfig(process.env);
  const port = parsePort(process.env, 3000);

  return {
    apiUrl,
    publicApiUrl,
    authMode,
    environment,
    port,
  };
}

async function main() {
  await access(entrypoint).catch(() => {
    throw new Error(
      `Expected compiled web entrypoint at ${entrypoint}. Run "pnpm --filter @naval/web build" before starting production mode.`,
    );
  });

  const runtimeConfig = assertWebRuntimeEnvironment();
  console.log(
    `[web] Startup checks passed ${JSON.stringify({
      environment: runtimeConfig.environment,
      port: runtimeConfig.port,
      apiUrl: runtimeConfig.apiUrl,
      publicApiUrl: runtimeConfig.publicApiUrl,
      authMode: runtimeConfig.authMode,
      healthPaths: {
        live: '/api/health/live',
        ready: '/api/health/ready',
      },
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
  console.error(formatStartupFailure('web', error));
  process.exit(1);
});
