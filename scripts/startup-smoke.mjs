import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { formatDatabaseTarget, parseDatabaseUrl } from './startup-runtime.mjs';

const execFileAsync = promisify(execFile);
const rootDir = process.cwd();
const artifactDir = path.resolve(rootDir, process.env['STARTUP_SMOKE_ARTIFACT_DIR'] ?? 'artifacts/startup-smoke');
const composeFile = path.join(rootDir, 'docker-compose.production-smoke.yml');
const composeProject = `naval-startup-${Date.now()}`;
const readinessTimeoutMs = Number(process.env['STARTUP_SMOKE_READY_TIMEOUT_MS'] ?? '120000');
const expectedWebMarker = process.env['STARTUP_SMOKE_EXPECTED_WEB_MARKER'] ?? 'Digital Twin Platform';
const workerReadyFile = `/tmp/naval-startup-smoke-worker-ready-${Date.now()}`;
const smokeEnv = {
  ...process.env,
  NODE_ENV: 'production',
  JWT_SECRET:
    process.env['JWT_SECRET'] ?? '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  AUTH_BOOTSTRAP_SECRET: process.env['AUTH_BOOTSTRAP_SECRET'] ?? 'bootstrap-secret-for-smoke',
  API_SERVICE_USER_ID: process.env['API_SERVICE_USER_ID'] ?? 'dev-user-admin',
  API_SERVICE_EMAIL: process.env['API_SERVICE_EMAIL'] ?? 'cmdr.lee@naval-systems.dev',
  API_SERVICE_ORGANIZATION_ID: process.env['API_SERVICE_ORGANIZATION_ID'] ?? 'dev-org',
  API_SERVICE_ROLE: process.env['API_SERVICE_ROLE'] ?? 'ADMIN',
  DATABASE_URL:
    process.env['DATABASE_URL'] ?? 'postgresql://naval:naval_dev@127.0.0.1:54329/naval_dt',
};
const services = [];

async function run(command, args, options = {}) {
  const label = [command, ...args].join(' ');
  console.log(`\n▶ ${label}`);

  try {
    const result = await execFileAsync(command, args, {
      cwd: rootDir,
      env: smokeEnv,
      maxBuffer: 1024 * 1024 * 20,
      ...options,
    });

    if (result.stdout?.trim()) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr?.trim()) {
      process.stderr.write(result.stderr);
    }

    return result.stdout ?? '';
  } catch (error) {
    if (error?.stdout) process.stdout.write(error.stdout);
    if (error?.stderr) process.stderr.write(error.stderr);
    throw new Error(`Command failed: ${label}`);
  }
}

function startService(name, entrypoint, envOverrides = {}) {
  const child = spawn(process.execPath, [entrypoint], {
    cwd: rootDir,
    env: {
      ...smokeEnv,
      ...envOverrides,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  const append = (chunk, streamName) => {
    const text = chunk.toString();
    output += text;
    process[streamName].write(`[${name}] ${text}`);
  };

  child.stdout.on('data', (chunk) => append(chunk, 'stdout'));
  child.stderr.on('data', (chunk) => append(chunk, 'stderr'));

  const record = {
    name,
    child,
    getOutput: () => output,
  };
  services.push(record);
  return record;
}

async function stopService(service) {
  if (service.child.exitCode !== null || service.child.killed) {
    return;
  }

  service.child.kill('SIGTERM');
  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 10_000);
    service.child.once('exit', () => {
      clearTimeout(timeout);
      resolve(undefined);
    });
  });
}

async function waitFor(check, description, timeoutMs = readinessTimeoutMs, intervalMs = 2_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const result = await check();
      if (result) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `${description} did not become ready within ${Math.round(timeoutMs / 1000)}s${lastError instanceof Error ? `: ${lastError.message}` : ''}`,
  );
}

async function httpExpect(url, options = {}, expectedStatus = 200) {
  const response = await fetch(url, { redirect: 'manual', ...options });
  const body = await response.text();
  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} from ${url} but received ${response.status}: ${body}`);
  }

  return { response, body };
}

async function captureArtifacts() {
  await mkdir(artifactDir, { recursive: true });

  await Promise.all(
    services.map(async (service) => {
      await writeFile(path.join(artifactDir, `${service.name}.log`), service.getOutput(), 'utf8');
    }),
  );

  await Promise.all([
    writeFile(path.join(artifactDir, 'env-summary.json'), JSON.stringify({
      databaseTarget: formatDatabaseTarget(parseDatabaseUrl(smokeEnv.DATABASE_URL)),
      apiPort: 4100,
      webPort: 3100,
      workerReadyFile,
    }, null, 2), 'utf8'),
    run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'logs', '--no-color', 'db']).then((content) =>
      writeFile(path.join(artifactDir, 'db.log'), content, 'utf8'),
    ),
  ]);
}

async function cleanup() {
  await Promise.allSettled(services.map((service) => stopService(service)));
  await rm(workerReadyFile, { force: true }).catch(() => undefined);
  try {
    await run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'down', '-v']);
  } catch {
    // Best-effort cleanup only.
  }
}

async function main() {
  await rm(artifactDir, { recursive: true, force: true });
  await mkdir(artifactDir, { recursive: true });

  try {
    await run('pnpm', ['db:generate']);
    await run('pnpm', ['db:validate']);
    await run('pnpm', ['build']);
    await run('pnpm', ['verify:artifacts']);

    await run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'up', '-d', 'db']);
    await waitFor(async () => {
      const output = await run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'ps', '--status', 'running', 'db']);
      return output.includes('db');
    }, 'database container');

    await run('pnpm', ['db:migrate:deploy']);
    await run('pnpm', ['db:migrate:status']);
    await run('pnpm', ['db:seed']);

    const api = startService('api', path.join(rootDir, 'apps/api/scripts/start-production.mjs'), {
      PORT: '4100',
      DATABASE_URL: smokeEnv.DATABASE_URL,
    });

    const apiReadyBody = await waitFor(async () => {
      const response = await fetch('http://127.0.0.1:4100/api/v1/health/ready');
      if (!response.ok) {
        return null;
      }

      const body = await response.json();
      return body?.status === 'ok' ? body : null;
    }, 'built API readiness endpoint');

    const worker = startService('worker', path.join(rootDir, 'apps/worker/scripts/start-production.mjs'), {
      DATABASE_URL: smokeEnv.DATABASE_URL,
      WORKER_READY_FILE: workerReadyFile,
    });

    await waitFor(async () => {
      try {
        const contents = await readFile(workerReadyFile, 'utf8');
        return contents.trim().length > 0 ? contents.trim() : null;
      } catch {
        return null;
      }
    }, 'worker ready file');

    const web = startService('web', path.join(rootDir, 'apps/web/scripts/start-production.mjs'), {
      PORT: '3100',
      API_URL: 'http://127.0.0.1:4100',
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4100',
    });

    const webReadyBody = await waitFor(async () => {
      const response = await fetch('http://127.0.0.1:3100/api/health/ready');
      if (!response.ok) {
        return null;
      }

      const body = await response.json();
      return body?.status === 'ok' ? body : null;
    }, 'built web readiness endpoint');

    const authTokenResponse = await httpExpect('http://127.0.0.1:4100/api/v1/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: smokeEnv.API_SERVICE_USER_ID,
        email: smokeEnv.API_SERVICE_EMAIL,
        organizationId: smokeEnv.API_SERVICE_ORGANIZATION_ID,
        role: smokeEnv.API_SERVICE_ROLE,
        bootstrapSecret: smokeEnv.AUTH_BOOTSTRAP_SECRET,
      }),
    }, 201);
    const { accessToken } = JSON.parse(authTokenResponse.body);
    if (!accessToken) {
      throw new Error('Auth bootstrap response did not include accessToken.');
    }

    await httpExpect('http://127.0.0.1:4100/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const homepage = await httpExpect('http://127.0.0.1:3100');
    if (!homepage.body.includes(expectedWebMarker)) {
      throw new Error('Built web runtime did not render the expected homepage marker.');
    }

    const workerLogs = worker.getOutput();
    if (
      !workerLogs.includes('Startup checks passed') ||
      !workerLogs.includes('Database connection OK') ||
      !workerLogs.includes('Ready')
    ) {
      throw new Error('Worker logs did not confirm a healthy startup from built artifacts.');
    }

    await writeFile(
      path.join(artifactDir, 'startup-smoke-summary.json'),
      JSON.stringify(
        {
          apiReady: apiReadyBody,
          webReady: webReadyBody,
          services: {
            apiExitCode: api.child.exitCode,
            workerExitCode: worker.child.exitCode,
            webExitCode: web.child.exitCode,
          },
        },
        null,
        2,
      ),
      'utf8',
    );

    console.log('\n✅ Startup smoke passed.');
  } catch (error) {
    await captureArtifacts();
    throw error;
  } finally {
    await cleanup();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
