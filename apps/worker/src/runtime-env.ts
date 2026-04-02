function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set before the worker can start.`);
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

export function formatWorkerDatabaseTarget(url: URL): string {
  return `${url.hostname}:${url.port || '5432'}${url.pathname}`;
}

export function assertWorkerRuntimeEnvironment(): {
  databaseUrl: URL;
  readyFile?: string;
} {
  const databaseUrl = readRequiredEnv('DATABASE_URL');
  const readyFile = process.env['WORKER_READY_FILE']?.trim();

  return {
    databaseUrl: parseDatabaseUrl(databaseUrl),
    ...(readyFile ? { readyFile } : {}),
  };
}
