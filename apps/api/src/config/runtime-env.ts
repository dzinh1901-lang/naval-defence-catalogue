function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set before the API can start.`);
  }

  return value;
}

function parseDatabaseUrl(connectionString: string): URL {
  let parsed: URL;
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

export function formatDatabaseTarget(url: URL): string {
  return `${url.hostname}:${url.port || '5432'}${url.pathname}`;
}

function parseCorsOrigins(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((origin) => {
      try {
        const parsed = new URL(origin);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error();
        }
        return parsed.origin;
      } catch {
        throw new Error(`CORS_ALLOWED_ORIGINS must contain valid absolute http(s) origins. Received "${origin}".`);
      }
    });
}

export function assertApiRuntimeEnvironment(): { databaseUrl: URL; port: number; corsAllowedOrigins: string[] } {
  const databaseUrl = parseDatabaseUrl(readRequiredEnv('DATABASE_URL'));
  const corsAllowedOrigins = parseCorsOrigins(process.env['CORS_ALLOWED_ORIGINS']);

  const configuredPort = process.env['PORT']?.trim();
  if (!configuredPort) {
    return {
      databaseUrl,
      port: 4000,
      corsAllowedOrigins,
    };
  }

  const port = Number(configuredPort);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`PORT must be an integer between 1 and 65535. Received "${configuredPort}".`);
  }

  return {
    databaseUrl,
    port,
    corsAllowedOrigins,
  };
}
