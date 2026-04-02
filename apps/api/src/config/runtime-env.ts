function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set before the API can start.`);
  }

  return value;
}

export function assertApiRuntimeEnvironment(): void {
  readRequiredEnv('DATABASE_URL');

  const configuredPort = process.env['PORT']?.trim();
  if (!configuredPort) {
    return;
  }

  const port = Number(configuredPort);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`PORT must be an integer between 1 and 65535. Received "${configuredPort}".`);
  }
}
