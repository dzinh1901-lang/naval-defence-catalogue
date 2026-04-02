import { createHmac } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const rootDir = process.cwd();
const artifactDir = path.resolve(
  rootDir,
  process.env['PRODUCTION_SMOKE_ARTIFACT_DIR'] ?? 'artifacts/production-smoke',
);
const composeFile = path.join(rootDir, 'docker-compose.production-smoke.yml');
const composeProject = `naval-smoke-${Date.now()}`;
const readinessTimeoutMs = Number(process.env['PRODUCTION_SMOKE_READY_TIMEOUT_MS'] ?? '120000');
const smokeEnv = {
  ...process.env,
  JWT_SECRET:
    process.env['JWT_SECRET'] ?? '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  AUTH_BOOTSTRAP_SECRET: process.env['AUTH_BOOTSTRAP_SECRET'] ?? 'bootstrap-secret-for-smoke',
  API_SERVICE_USER_ID: process.env['API_SERVICE_USER_ID'] ?? 'dev-user-admin',
  API_SERVICE_EMAIL: process.env['API_SERVICE_EMAIL'] ?? 'cmdr.lee@naval-systems.dev',
  API_SERVICE_ORGANIZATION_ID: process.env['API_SERVICE_ORGANIZATION_ID'] ?? 'dev-org',
  API_SERVICE_ROLE: process.env['API_SERVICE_ROLE'] ?? 'ADMIN',
  DATABASE_URL:
    process.env['DATABASE_URL'] ?? 'postgresql://naval:naval_dev@localhost:54329/naval_dt',
};

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/g, '');
}

function createExpiredJwt(secret) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: smokeEnv.API_SERVICE_USER_ID,
      email: smokeEnv.API_SERVICE_EMAIL,
      organizationId: smokeEnv.API_SERVICE_ORGANIZATION_ID,
      role: smokeEnv.API_SERVICE_ROLE,
      exp: Math.floor(Date.now() / 1000) - 60,
    }),
  );
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/g, '');

  return `${header}.${payload}.${signature}`;
}

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

async function captureArtifacts() {
  await mkdir(artifactDir, { recursive: true });

  const capture = async (filename, producer) => {
    try {
      const content = await producer();
      await writeFile(path.join(artifactDir, filename), content, 'utf8');
    } catch (error) {
      await writeFile(
        path.join(artifactDir, filename),
        error instanceof Error ? error.message : String(error),
        'utf8',
      );
    }
  };

  await Promise.all([
    capture('docker-compose-ps.txt', async () =>
      await run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'ps', '--all']),
    ),
    capture('docker-compose-logs.txt', async () =>
      await run('docker', [
        'compose',
        '-f',
        composeFile,
        '-p',
        composeProject,
        'logs',
        '--no-color',
        '--timestamps',
      ]),
    ),
    capture('worker-logs.txt', async () =>
      await run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'logs', 'worker']),
    ),
  ]);
}

async function cleanup() {
  try {
    await run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'down', '-v']);
  } catch {
    // Best-effort cleanup only.
  }
}

async function waitFor(check, description, timeoutMs = readinessTimeoutMs, intervalMs = 2_500) {
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

async function main() {
  await rm(artifactDir, { recursive: true, force: true });
  await mkdir(artifactDir, { recursive: true });

  try {
    await run('pnpm', ['db:generate']);
    await run('pnpm', ['db:validate']);
    await run('pnpm', ['build']);
    await run('pnpm', ['verify:artifacts']);

    await run('docker', ['build', '--file', 'infra/docker/Dockerfile.api', '--tag', 'naval-api:smoke', '.']);
    await run('docker', ['build', '--file', 'infra/docker/Dockerfile.web', '--tag', 'naval-web:smoke', '.']);
    await run('docker', ['build', '--file', 'infra/docker/Dockerfile.worker', '--tag', 'naval-worker:smoke', '.']);

    await run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'up', '-d', 'db']);

    await waitFor(async () => {
      const output = await run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'ps', '--status', 'running', 'db']);
      return output.includes('db');
    }, 'database container');

    await run('pnpm', ['db:migrate:deploy']);
    await run('pnpm', ['db:migrate:status']);
    await run('pnpm', ['db:seed']);

    await run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'up', '-d', 'api', 'web', 'worker']);

    const apiBase = 'http://localhost:4400';
    const webBase = 'http://localhost:3300';

    const liveBody = await waitFor(async () => {
      const response = await fetch(`${apiBase}/api/v1/health/live`);
      if (!response.ok) {
        return null;
      }

      const body = await response.json();
      if (body?.status === 'ok' && body?.signal === 'live') {
        return body;
      }

      return null;
    }, 'API live endpoint');

    const readyBody = await waitFor(async () => {
      const response = await fetch(`${apiBase}/api/v1/health/ready`);
      if (!response.ok) {
        return null;
      }

      const body = await response.json();
      if (body?.status === 'ok' && body?.services?.database === 'ok') {
        return body;
      }

      return null;
    }, 'API readiness endpoint');

    await waitFor(async () => {
      const response = await fetch(webBase);
      if (!response.ok) {
        return null;
      }

      const body = await response.text();
      return body.includes('Digital Twin Platform') ? body : null;
    }, 'web root');

    const missingAuth = await httpExpect(`${apiBase}/api/v1/auth/me`, {}, 401);
    if (!missingAuth.body.includes('Missing or invalid Authorization')) {
      throw new Error(`Unexpected missing-auth response: ${missingAuth.body}`);
    }

    const invalidAuth = await httpExpect(
      `${apiBase}/api/v1/auth/me`,
      { headers: { Authorization: 'Bearer not-a-valid-token' } },
      401,
    );
    if (!invalidAuth.body.includes('Bearer token is invalid')) {
      throw new Error(`Unexpected invalid-auth response: ${invalidAuth.body}`);
    }

    const expiredToken = createExpiredJwt(smokeEnv.JWT_SECRET);
    const expiredAuth = await httpExpect(
      `${apiBase}/api/v1/auth/me`,
      { headers: { Authorization: `Bearer ${expiredToken}` } },
      401,
    );
    if (!expiredAuth.body.includes('expired')) {
      throw new Error(`Unexpected expired-token response: ${expiredAuth.body}`);
    }

    const validTokenResponse = await httpExpect(
      `${apiBase}/api/v1/auth/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: smokeEnv.API_SERVICE_USER_ID,
          email: smokeEnv.API_SERVICE_EMAIL,
          organizationId: smokeEnv.API_SERVICE_ORGANIZATION_ID,
          role: smokeEnv.API_SERVICE_ROLE,
          bootstrapSecret: smokeEnv.AUTH_BOOTSTRAP_SECRET,
        }),
      },
      201,
    );
    const { accessToken } = JSON.parse(validTokenResponse.body);
    if (!accessToken) {
      throw new Error('Auth bootstrap response did not include accessToken.');
    }

    const meResponse = await httpExpect(`${apiBase}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const mePayload = JSON.parse(meResponse.body);
    if (mePayload.organizationId !== smokeEnv.API_SERVICE_ORGANIZATION_ID) {
      throw new Error(`Unexpected /auth/me payload: ${meResponse.body}`);
    }

    const projectsResponse = await httpExpect(`${apiBase}/api/v1/projects`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const projects = JSON.parse(projectsResponse.body);
    if (!Array.isArray(projects) || projects.length === 0) {
      throw new Error('Expected seeded projects from the API.');
    }

    const [primaryProject] = projects;
    const homepage = await httpExpect(webBase);
    if (!homepage.body.includes(primaryProject.name)) {
      throw new Error(`Web homepage did not render live API project data for "${primaryProject.name}".`);
    }

    const projectPage = await httpExpect(`${webBase}/projects/${primaryProject.id}`);
    if (!projectPage.body.includes(primaryProject.name)) {
      throw new Error(`Web project route did not render "${primaryProject.name}".`);
    }

    const projectDetailResponse = await httpExpect(`${apiBase}/api/v1/projects/${primaryProject.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const projectDetail = JSON.parse(projectDetailResponse.body);
    const firstTwinId = projectDetail?.twins?.[0]?.id;
    if (!firstTwinId) {
      throw new Error(`Expected project "${primaryProject.name}" to include at least one twin.`);
    }

    const workspaceSummaryResponse = await httpExpect(`${apiBase}/api/v1/workspace/${firstTwinId}`);
    const workspaceSummary = JSON.parse(workspaceSummaryResponse.body);
    if (workspaceSummary?.project?.id !== primaryProject.id) {
      throw new Error(`Workspace summary did not resolve back to project "${primaryProject.id}".`);
    }

    const currentViewConfigResponse = await httpExpect(`${apiBase}/api/v1/workspace/${firstTwinId}/view-config`);
    const currentViewConfig = JSON.parse(currentViewConfigResponse.body);
    const viewConfigPayload = {
      selectedMaterialId:
        currentViewConfig?.selectedMaterialId ?? currentViewConfig?.selectedMaterial?.id ?? null,
      selectedLightingId:
        currentViewConfig?.selectedLightingId ?? currentViewConfig?.selectedLighting?.id ?? null,
      camDof: currentViewConfig?.camDof ?? 3,
      camFstop: currentViewConfig?.camFstop ?? 30,
    };

    const proxyViewConfigResponse = await httpExpect(
      `${webBase}/api/workspace/${firstTwinId}/view-config`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(viewConfigPayload),
      },
    );
    const proxyViewConfig = JSON.parse(proxyViewConfigResponse.body);
    if (proxyViewConfig?.twinId !== firstTwinId) {
      throw new Error('Workspace proxy mutation did not persist the expected twin configuration.');
    }

    const twinPage = await httpExpect(`${webBase}/projects/${primaryProject.id}/twins/${firstTwinId}`);
    if (!twinPage.body.includes(workspaceSummary?.twin?.name ?? '')) {
      throw new Error(
        `Web twin route did not render "${workspaceSummary?.twin?.name ?? firstTwinId}".`,
      );
    }

    const workerLogs = await run('docker', ['compose', '-f', composeFile, '-p', composeProject, 'logs', 'worker']);
    if (
      !workerLogs.includes('Database connection OK') ||
      !workerLogs.includes('Milestone 1 scaffold ready') ||
      !workerLogs.includes('Startup checks passed')
    ) {
      throw new Error('Worker logs did not confirm database-ready production startup.');
    }

    await writeFile(
      path.join(artifactDir, 'smoke-summary.json'),
      JSON.stringify(
        {
          apiBase,
          webBase,
          live: liveBody,
          ready: readyBody,
          projectId: primaryProject.id,
          projectName: primaryProject.name,
          twinId: firstTwinId,
        },
        null,
        2,
      ),
      'utf8',
    );

    console.log('\n✅ Production smoke pipeline passed.');
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
