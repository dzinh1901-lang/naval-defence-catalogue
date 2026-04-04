const validNodeEnvironments = new Set(['development', 'test', 'smoke', 'staging', 'production']);
const validServiceRoles = new Set(['ADMIN', 'MEMBER', 'VIEWER']);
const serviceBootstrapFieldNames = [
  'AUTH_BOOTSTRAP_SECRET',
  'API_SERVICE_USER_ID',
  'API_SERVICE_EMAIL',
  'API_SERVICE_ORGANIZATION_ID',
  'API_SERVICE_ROLE',
];

function readConfiguredEnv(env, name) {
  return env[name]?.trim();
}

export function readRequiredEnv(env, name, service) {
  const value = readConfiguredEnv(env, name);
  if (!value) {
    throw new Error(`${name} must be set before starting the ${service} runtime.`);
  }

  return value;
}

export function getNodeEnvironment(env) {
  const nodeEnv = readConfiguredEnv(env, 'NODE_ENV') ?? 'development';
  if (!validNodeEnvironments.has(nodeEnv)) {
    throw new Error(
      `NODE_ENV must be one of ${Array.from(validNodeEnvironments).join(', ')}. Received "${nodeEnv}".`,
    );
  }

  return nodeEnv;
}

export function parseDatabaseUrl(connectionString) {
  let parsed;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string.');
  }

  if (!['postgresql:', 'postgres:'].includes(parsed.protocol)) {
    throw new Error('DATABASE_URL must use the postgresql:// or postgres:// protocol.');
  }

  return parsed;
}

export function formatDatabaseTarget(url) {
  return `${url.hostname}:${url.port || '5432'}${url.pathname}`;
}

export function parsePort(env, defaultPort) {
  const configuredPort = readConfiguredEnv(env, 'PORT');
  if (!configuredPort) {
    return defaultPort;
  }

  const port = Number(configuredPort);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`PORT must be an integer between 1 and 65535. Received "${configuredPort}".`);
  }

  return port;
}

function isLoopbackHost(hostname) {
  return ['localhost', '127.0.0.1', '::1'].includes(hostname);
}

function isPrivateIpv4(hostname) {
  return (
    /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
    /^192\.168\.\d+\.\d+$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname)
  );
}

export function classifyUrlTarget(url) {
  const hostname = url.hostname.toLowerCase();
  if (isLoopbackHost(hostname)) {
    return 'loopback';
  }

  if (isPrivateIpv4(hostname)) {
    return 'private-network';
  }

  if (!hostname.includes('.')) {
    return 'container-service';
  }

  return 'public-network';
}

export function normalizeHttpUrl(name, value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL. Received "${value}".`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${name} must use http:// or https://. Received "${value}".`);
  }

  return new URL(parsed.toString().replace(/\/$/, ''));
}

export function describeHttpEndpoint(name, value, options = {}) {
  const normalizedUrl = normalizeHttpUrl(name, value);
  const target = classifyUrlTarget(normalizedUrl);

  if (options.publicEndpoint && target === 'container-service') {
    throw new Error(
      `${name} must be browser-reachable. Container-only hostnames such as "${normalizedUrl.hostname}" are not valid for public URLs.`,
    );
  }

  return {
    name,
    value: normalizedUrl.toString(),
    target,
  };
}

export function readOptionalReadyFile(env) {
  const readyFile = readConfiguredEnv(env, 'WORKER_READY_FILE');
  if (!readyFile) {
    return undefined;
  }

  if (!readyFile.startsWith('/')) {
    throw new Error('WORKER_READY_FILE must be an absolute path when set.');
  }

  return readyFile;
}

export function validateWebAuthConfig(env) {
  const explicitToken = readConfiguredEnv(env, 'API_AUTH_TOKEN');
  const configuredValues = Object.fromEntries(
    serviceBootstrapFieldNames.map((name) => [name, readConfiguredEnv(env, name)]),
  );
  const configuredBootstrapFields = serviceBootstrapFieldNames.filter((name) => configuredValues[name]);

  if (configuredBootstrapFields.length > 0 && configuredBootstrapFields.length !== serviceBootstrapFieldNames.length) {
    throw new Error(
      `To bootstrap a server-side API token, set all of ${serviceBootstrapFieldNames.join(', ')} together.`,
    );
  }

  if (configuredBootstrapFields.length === serviceBootstrapFieldNames.length) {
    if ((configuredValues['AUTH_BOOTSTRAP_SECRET']?.length ?? 0) < 8) {
      throw new Error('AUTH_BOOTSTRAP_SECRET must be at least 8 characters when bootstrap auth is configured.');
    }

    if (!validServiceRoles.has(configuredValues['API_SERVICE_ROLE'])) {
      throw new Error('API_SERVICE_ROLE must be one of ADMIN, MEMBER, or VIEWER.');
    }
  }

  if (!explicitToken && configuredBootstrapFields.length !== serviceBootstrapFieldNames.length) {
    throw new Error(
      'Configure API_AUTH_TOKEN or AUTH_BOOTSTRAP_SECRET + API_SERVICE_* before starting the web app in production mode.',
    );
  }

  return explicitToken ? 'token' : 'bootstrap';
}

export function parseCorsOrigins(env) {
  const raw = env['CORS_ALLOWED_ORIGINS']?.trim();
  if (!raw) return [];

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((origin) => {
      let parsed;
      try {
        parsed = new URL(origin);
      } catch {
        throw new Error(
          `CORS_ALLOWED_ORIGINS must contain valid absolute http(s) origins. Received "${origin}".`,
        );
      }

      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error(
          `CORS_ALLOWED_ORIGINS must contain valid absolute http(s) origins. Received "${origin}".`,
        );
      }

      return parsed.origin;
    });
}

export function formatStartupFailure(service, error) {
  const message = error instanceof Error ? error.message : String(error);
  return JSON.stringify({
    service,
    status: 'startup-failed',
    message,
  });
}
