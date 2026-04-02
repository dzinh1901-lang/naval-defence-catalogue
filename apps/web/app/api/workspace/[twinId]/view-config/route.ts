import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBase, getServerApiHeaders } from '@/lib/env';

interface RouteContext {
  params: Promise<{ twinId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { twinId } = await context.params;
  const body = await request.text();

  const response = await fetch(`${getServerApiBase()}/api/v1/workspace/${twinId}/view-config`, {
    method: 'PATCH',
    cache: 'no-store',
    headers: await getServerApiHeaders({
      'Content-Type': request.headers.get('content-type') ?? 'application/json',
    }),
    body,
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
}
