export function isProductionEnv(): boolean {
  return process.env['NODE_ENV'] === 'production';
}

export function getJwtSecret(): string {
  const configuredSecret = process.env['JWT_SECRET']?.trim();
  if (!configuredSecret) {
    throw new Error('JWT_SECRET must be set before the API can issue or validate bearer tokens.');
  }

  if (configuredSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }

  return configuredSecret;
}

export function assertAuthEnvironment(): void {
  getJwtSecret();

  const bootstrapSecret = process.env['AUTH_BOOTSTRAP_SECRET']?.trim();
  if (bootstrapSecret && bootstrapSecret.length < 8) {
    throw new Error('AUTH_BOOTSTRAP_SECRET must be at least 8 characters when set.');
  }
}
