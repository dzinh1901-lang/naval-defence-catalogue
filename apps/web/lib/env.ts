function isProductionEnv(): boolean {
  return process.env['NODE_ENV'] === 'production';
}

function getFirstConfiguredValue(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value && value.trim().length > 0)?.trim();
}

export function getServerApiBase(): string {
  const base = getFirstConfiguredValue(process.env['API_URL'], process.env['NEXT_PUBLIC_API_URL']);
  if (!base) {
    throw new Error('API_URL is not configured. Set API_URL (server-side) in your environment.');
  }

  return base.replace(/\/$/, '');
}

export function getServerApiAuthToken(): string | undefined {
  return (
    getFirstConfiguredValue(process.env['API_AUTH_TOKEN'], process.env['NEXT_PUBLIC_API_AUTH_TOKEN']) ??
    (isProductionEnv() ? undefined : 'dev-token')
  );
}

export function getPublicApiBase(): string {
  const base = getFirstConfiguredValue(process.env['NEXT_PUBLIC_API_URL'], process.env['API_URL']);
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not configured. Set NEXT_PUBLIC_API_URL for browser-side API requests.',
    );
  }

  return base.replace(/\/$/, '');
}

export function getPublicApiAuthToken(): string | undefined {
  return (
    getFirstConfiguredValue(process.env['NEXT_PUBLIC_API_AUTH_TOKEN']) ??
    (isProductionEnv() ? undefined : 'dev-token')
  );
}
