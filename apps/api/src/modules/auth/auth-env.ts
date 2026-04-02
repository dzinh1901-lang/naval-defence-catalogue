const DEV_JWT_SECRET = 'dev-secret-change-in-production';

export function isProductionEnv(): boolean {
  return process.env['NODE_ENV'] === 'production';
}

export function getJwtSecret(): string {
  const configuredSecret = process.env['JWT_SECRET']?.trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  if (isProductionEnv()) {
    throw new Error('JWT_SECRET must be set in production.');
  }

  return DEV_JWT_SECRET;
}

export function canUseDevAuthFallback(): boolean {
  return !isProductionEnv() && !process.env['JWT_SECRET']?.trim();
}

export function assertAuthEnvironment(): void {
  const jwtSecret = process.env['JWT_SECRET']?.trim();
  if (isProductionEnv() && (!jwtSecret || jwtSecret.length < 32)) {
    throw new Error('JWT_SECRET must be set to at least 32 characters in production.');
  }

  const bootstrapSecret = process.env['AUTH_BOOTSTRAP_SECRET']?.trim();
  if (bootstrapSecret && bootstrapSecret.length < 8) {
    throw new Error('AUTH_BOOTSTRAP_SECRET must be at least 8 characters when set.');
  }
}
