import { NextResponse } from 'next/server';
import { assertWebRuntimeEnvironment, getServerApiBase } from '../../../../lib/env';

export async function GET() {
  assertWebRuntimeEnvironment();

  try {
    const apiReadyResponse = await fetch(`${getServerApiBase()}/api/v1/health/ready`, {
      cache: 'no-store',
    });
    const apiReadyBody = await apiReadyResponse.json().catch(() => null);

    if (!apiReadyResponse.ok || apiReadyBody?.status !== 'ok') {
      return NextResponse.json(
        {
          status: 'not-ready',
          signal: 'ready',
          service: 'web',
          dependency: 'api',
          apiStatus: apiReadyBody?.status ?? 'error',
          message: 'The web runtime could not confirm API readiness from API_URL.',
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: 'ok',
      signal: 'ready',
      service: 'web',
      dependency: 'api',
      apiStatus: apiReadyBody.status,
      apiTarget: getServerApiBase(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not-ready',
        signal: 'ready',
        service: 'web',
        dependency: 'api',
        apiStatus: 'error',
        message: `API readiness check failed: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
