function isProductionEnv(): boolean {
  return process.env['NODE_ENV'] === 'production';
}

const serviceAuthFieldNames = [
  'AUTH_BOOTSTRAP_SECRET',
  'API_SERVICE_USER_ID',
  'API_SERVICE_EMAIL',
  'API_SERVICE_ORGANIZATION_ID',
  'API_SERVICE_ROLE',
] as const;
const serviceRoles = ['ADMIN', 'MEMBER', 'VIEWER'] as const;

type ServiceAuthConfig = {
  bootstrapSecret: string;
  userId: string;
  email: string;
  organizationId: string;
  role: (typeof serviceRoles)[number];
};

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

function getServiceAuthConfig(): ServiceAuthConfig | null {
  const configuredValues = Object.fromEntries(
    serviceAuthFieldNames.map((name) => [name, process.env[name]?.trim()]),
  ) as Record<(typeof serviceAuthFieldNames)[number], string | undefined>;

  const configuredFieldCount = serviceAuthFieldNames.filter((name) => configuredValues[name]).length;
  if (configuredFieldCount === 0) {
    return null;
  }

  if (configuredFieldCount !== serviceAuthFieldNames.length) {
    throw new Error(
      `To bootstrap a server-side API token, set all of ${serviceAuthFieldNames.join(', ')} together.`,
    );
  }

  if (!serviceRoles.includes(configuredValues['API_SERVICE_ROLE']! as (typeof serviceRoles)[number])) {
    throw new Error('API_SERVICE_ROLE must be one of ADMIN, MEMBER, or VIEWER.');
  }

  return {
    bootstrapSecret: configuredValues['AUTH_BOOTSTRAP_SECRET']!,
    userId: configuredValues['API_SERVICE_USER_ID']!,
    email: configuredValues['API_SERVICE_EMAIL']!,
    organizationId: configuredValues['API_SERVICE_ORGANIZATION_ID']!,
    role: configuredValues['API_SERVICE_ROLE']! as ServiceAuthConfig['role'],
  };
}

export function assertWebRuntimeEnvironment(): void {
  getServerApiBase();

  if (!getFirstConfiguredValue(process.env['NEXT_PUBLIC_API_URL'])) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not configured. Set NEXT_PUBLIC_API_URL so browser-visible URLs stay explicit in production.',
    );
  }

  if (getFirstConfiguredValue(process.env['NEXT_PUBLIC_API_AUTH_TOKEN'])) {
    throw new Error(
      'NEXT_PUBLIC_API_AUTH_TOKEN is no longer supported. Use the server-side API proxy and API_AUTH_TOKEN or AUTH_BOOTSTRAP_SECRET + API_SERVICE_* instead.',
    );
  }

  const hasExplicitToken = Boolean(getFirstConfiguredValue(process.env['API_AUTH_TOKEN']));
  const hasBootstrapConfig = Boolean(getServiceAuthConfig());
  if (isProductionEnv() && !hasExplicitToken && !hasBootstrapConfig) {
    throw new Error(
      'Configure API_AUTH_TOKEN or AUTH_BOOTSTRAP_SECRET + API_SERVICE_* before starting the web app in production mode.',
    );
  }
}

let cachedServerApiAuthToken: string | undefined;
let pendingTokenPromise: Promise<string> | null = null;

async function issueServerApiToken(): Promise<string> {
  const config = getServiceAuthConfig();
  if (!config) {
    throw new Error(
      'No API_AUTH_TOKEN is configured and bootstrap auth settings are incomplete for server-side API access.',
    );
  }

  const response = await fetch(`${getServerApiBase()}/api/v1/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      userId: config.userId,
      email: config.email,
      organizationId: config.organizationId,
      role: config.role,
      bootstrapSecret: config.bootstrapSecret,
    }),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(
      `Failed to issue a server-side API token: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`,
    );
  }

  const parsed = JSON.parse(body) as { accessToken?: string };
  if (!parsed.accessToken) {
    throw new Error('Failed to issue a server-side API token: response did not include accessToken.');
  }

  return parsed.accessToken;
}

export async function resolveServerApiAuthToken(): Promise<string | undefined> {
  const explicitToken = getFirstConfiguredValue(process.env['API_AUTH_TOKEN']);
  if (explicitToken) {
    return explicitToken;
  }

  const serviceAuthConfig = getServiceAuthConfig();
  if (!serviceAuthConfig) {
    return undefined;
  }

  if (cachedServerApiAuthToken) {
    return cachedServerApiAuthToken;
  }

  if (!pendingTokenPromise) {
    pendingTokenPromise = (async () => {
      try {
        const token = await issueServerApiToken();
        cachedServerApiAuthToken = token;
        return token;
      } catch (error) {
        throw new Error(
          `Server-side API token bootstrap failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      } finally {
        pendingTokenPromise = null;
      }
    })();
  }

  return pendingTokenPromise;
}

export async function getServerApiHeaders(
  extraHeaders?: HeadersInit,
): Promise<Record<string, string>> {
  const token = await resolveServerApiAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders ? Object.fromEntries(new Headers(extraHeaders).entries()) : {}),
  };
}
