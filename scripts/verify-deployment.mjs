import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const artifactDir = path.resolve(
  process.cwd(),
  process.env['DEPLOYMENT_VERIFY_ARTIFACT_DIR'] ?? 'artifacts/deployment-verification',
);
const timeoutMs = Number(process.env['DEPLOYMENT_VERIFY_TIMEOUT_MS'] ?? '120000');

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set before running deployment verification.`);
  }

  return value;
}

function readOptionalEnv(name) {
  return process.env[name]?.trim();
}

function readRequiredUrl(name) {
  const value = readRequiredEnv(name);

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL. Received "${value}".`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${name} must use http:// or https://. Received "${value}".`);
  }

  return parsed.toString().replace(/\/$/, '');
}

function readOptionalUrl(name) {
  const value = readOptionalEnv(name);
  if (!value) {
    return undefined;
  }

  return readRequiredUrl(name);
}

function summarizeUrl(value) {
  const parsed = new URL(value);
  return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
}

async function writeArtifact(filename, value) {
  await writeFile(
    path.join(artifactDir, filename),
    typeof value === 'string' ? value : JSON.stringify(value, null, 2),
    'utf8',
  );
}

async function waitFor(check, description, intervalMs = 2_500) {
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

async function request(url, options = {}) {
  const response = await fetch(url, { redirect: 'manual', ...options });
  const body = await response.text();

  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body,
  };
}

async function expectStatus(url, options, expectedStatus, artifactName) {
  const result = await request(url, options);
  await writeArtifact(artifactName, result);

  if (result.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus} from ${url} but received ${result.status}: ${result.body}`);
  }

  return result;
}

async function issueToken(apiBase) {
  const explicitToken = readOptionalEnv('DEPLOYMENT_VERIFY_API_AUTH_TOKEN') ?? readOptionalEnv('API_AUTH_TOKEN');
  if (explicitToken) {
    return explicitToken;
  }

  const bootstrapSecret = readRequiredEnv('AUTH_BOOTSTRAP_SECRET');
  const userId = readRequiredEnv('API_SERVICE_USER_ID');
  const email = readRequiredEnv('API_SERVICE_EMAIL');
  const organizationId = readRequiredEnv('API_SERVICE_ORGANIZATION_ID');
  const role = readRequiredEnv('API_SERVICE_ROLE');

  const response = await expectStatus(
    `${apiBase}/api/v1/auth/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        organizationId,
        role,
        bootstrapSecret,
      }),
    },
    201,
    'auth-token.json',
  );

  const payload = JSON.parse(response.body);
  if (!payload?.accessToken) {
    throw new Error('Auth bootstrap response did not include accessToken.');
  }

  return payload.accessToken;
}

async function main() {
  const apiBase = readRequiredUrl('DEPLOYMENT_VERIFY_API_URL');
  const webBase = readRequiredUrl('DEPLOYMENT_VERIFY_WEB_URL');
  const workerHealthUrl = readOptionalUrl('DEPLOYMENT_VERIFY_WORKER_HEALTH_URL');

  await rm(artifactDir, { recursive: true, force: true });
  await mkdir(artifactDir, { recursive: true });

  await writeArtifact('verification-targets.json', {
    apiBase: summarizeUrl(apiBase),
    webBase: summarizeUrl(webBase),
    workerHealthUrl: workerHealthUrl ? summarizeUrl(workerHealthUrl) : null,
    authMode:
      readOptionalEnv('DEPLOYMENT_VERIFY_API_AUTH_TOKEN') || readOptionalEnv('API_AUTH_TOKEN')
        ? 'token'
        : 'bootstrap',
  });

  try {
    await waitFor(async () => {
      const response = await request(`${apiBase}/api/v1/health/live`);
      await writeArtifact('api-health-live.json', response);
      return response.status === 200 ? response : null;
    }, 'API liveness endpoint');

    const readiness = await waitFor(async () => {
      const response = await request(`${apiBase}/api/v1/health/ready`);
      await writeArtifact('api-health-ready.json', response);
      if (response.status !== 200) {
        return null;
      }

      const payload = JSON.parse(response.body);
      return payload?.status === 'ok' && payload?.services?.database === 'ok' ? payload : null;
    }, 'API readiness endpoint');

    const homepage = await waitFor(async () => {
      const response = await request(webBase);
      await writeArtifact('web-home.json', response);
      return response.status === 200 && response.body.includes('Digital Twin Platform') ? response : null;
    }, 'web root');

    const accessToken = await issueToken(apiBase);

    const meResponse = await expectStatus(
      `${apiBase}/api/v1/auth/me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      200,
      'auth-me.json',
    );
    const mePayload = JSON.parse(meResponse.body);

    const projectsResponse = await expectStatus(
      `${apiBase}/api/v1/projects`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      200,
      'projects.json',
    );
    const projects = JSON.parse(projectsResponse.body);
    if (!Array.isArray(projects) || projects.length === 0) {
      throw new Error('Expected at least one project from the API.');
    }

    const [primaryProject] = projects;
    const projectResponse = await expectStatus(
      `${apiBase}/api/v1/projects/${primaryProject.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      200,
      'project-detail.json',
    );
    const project = JSON.parse(projectResponse.body);

    const projectPage = await expectStatus(
      `${webBase}/projects/${primaryProject.id}`,
      undefined,
      200,
      'web-project.json',
    );
    if (!projectPage.body.includes(primaryProject.name)) {
      throw new Error(`Web project page did not render "${primaryProject.name}".`);
    }
    if (!homepage.body.includes(primaryProject.name)) {
      throw new Error(`Web homepage did not render "${primaryProject.name}".`);
    }

    const twinId = project?.twins?.[0]?.id;
    let workspaceSummary = null;
    let proxyMutation = null;
    let workerCheck = { status: 'skipped', reason: 'DEPLOYMENT_VERIFY_WORKER_HEALTH_URL is not configured.' };

    if (twinId) {
      const workspaceResponse = await expectStatus(
        `${apiBase}/api/v1/workspace/${twinId}`,
        undefined,
        200,
        'workspace-summary.json',
      );
      workspaceSummary = JSON.parse(workspaceResponse.body);

      const currentViewConfig = await expectStatus(
        `${apiBase}/api/v1/workspace/${twinId}/view-config`,
        undefined,
        200,
        'workspace-view-config-before.json',
      );
      const currentConfig = JSON.parse(currentViewConfig.body);

      const mutationPayload = {
        selectedMaterialId: currentConfig?.selectedMaterialId ?? currentConfig?.selectedMaterial?.id ?? null,
        selectedLightingId: currentConfig?.selectedLightingId ?? currentConfig?.selectedLighting?.id ?? null,
        camDof: currentConfig?.camDof ?? 3,
        camFstop: currentConfig?.camFstop ?? 30,
      };

      const proxyResponse = await expectStatus(
        `${webBase}/api/workspace/${twinId}/view-config`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mutationPayload),
        },
        200,
        'workspace-view-config-after.json',
      );
      proxyMutation = JSON.parse(proxyResponse.body);

      const twinPage = await expectStatus(
        `${webBase}/projects/${primaryProject.id}/twins/${twinId}`,
        undefined,
        200,
        'web-twin.json',
      );

      if (!twinPage.body.includes(workspaceSummary?.twin?.name ?? '')) {
        throw new Error(`Web twin page did not render "${workspaceSummary?.twin?.name ?? twinId}".`);
      }
    }

    if (workerHealthUrl) {
      workerCheck = await waitFor(async () => {
        const response = await request(workerHealthUrl);
        await writeArtifact('worker-health.json', response);
        return response.status === 200 ? { status: 'ok', url: summarizeUrl(workerHealthUrl) } : null;
      }, 'worker health endpoint');
    } else {
      await writeArtifact('worker-health.json', workerCheck);
    }

    await writeArtifact('deployment-verification-summary.json', {
      apiBase,
      webBase,
      readiness,
      auth: {
        userId: mePayload.userId,
        organizationId: mePayload.organizationId,
        role: mePayload.role,
      },
      project: {
        id: primaryProject.id,
        name: primaryProject.name,
      },
      workspace: workspaceSummary
        ? {
            twinId: workspaceSummary?.twin?.id,
            twinName: workspaceSummary?.twin?.name,
            mutationVerified: Boolean(proxyMutation),
          }
        : null,
      web: {
        homepageRendered: homepage.body.includes(primaryProject.name),
        projectRouteRendered: true,
      },
      workerCheck,
    });

    console.log('✅ Deployment verification passed.');
  } catch (error) {
    await writeArtifact('deployment-verification-error.json', {
      message: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
