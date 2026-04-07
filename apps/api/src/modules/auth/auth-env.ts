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

export function isBootstrapAuthEnabled(): boolean {
  return process.env['ALLOW_BOOTSTRAP_TOKEN_ISSUANCE']?.trim() === 'true';
}

export function getJwtExpiresInSeconds(): number {
  const configured = process.env['JWT_EXPIRES_IN_SECS']?.trim();
  if (!configured) {
    return 60 * 60 * 8;
  }

  const parsed = Number(configured);
  if (!Number.isInteger(parsed) || parsed < 300 || parsed > 60 * 60 * 24 * 30) {
    throw new Error('JWT_EXPIRES_IN_SECS must be an integer between 300 and 2592000 seconds.');
  }

  return parsed;
}

export function assertAuthEnvironment(): void {
  getJwtSecret();

  const bootstrapSecret = process.env['AUTH_BOOTSTRAP_SECRET']?.trim();
  if (bootstrapSecret && bootstrapSecret.length < 8) {
    throw new Error('AUTH_BOOTSTRAP_SECRET must be at least 8 characters when set.');
  }

  if (process.env['NODE_ENV'] === 'production' && bootstrapSecret && !isBootstrapAuthEnabled()) {
    throw new Error(
      'AUTH_BOOTSTRAP_SECRET is configured in production but ALLOW_BOOTSTRAP_TOKEN_ISSUANCE is not enabled. Remove bootstrap auth or explicitly opt in only for controlled environments.',
    );
  }
}
