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

export function assertApiRuntimeEnvironment(): { databaseUrl: URL; port: number } {
  const databaseUrl = parseDatabaseUrl(readRequiredEnv('DATABASE_URL'));

  const configuredPort = process.env['PORT']?.trim();
  if (!configuredPort) {
    return {
      databaseUrl,
      port: 4000,
    };
  }

  const port = Number(configuredPort);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`PORT must be an integer between 1 and 65535. Received "${configuredPort}".`);
  }

  return {
    databaseUrl,
    port,
  };
}
