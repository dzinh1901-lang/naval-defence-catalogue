import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import {
  ApiClientError,
  getWorkspaceViewConfig,
  updateWorkspaceViewConfig,
} from '@/lib/api';
import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBase, getServerApiHeaders } from '@/lib/env';

interface RouteContext {
  params: Promise<{ twinId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { twinId } = await context.params;

  try {
    const payload = await getWorkspaceViewConfig(twinId);
    return NextResponse.json(payload);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { twinId } = await context.params;

  try {
    const payload = await request.json();
    const updated = await updateWorkspaceViewConfig(twinId, payload);
    revalidatePath(`/twins/${twinId}/dashboard`);
    revalidatePath(`/twins/${twinId}/workspace`);
    return NextResponse.json(updated);
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof ApiClientError) {
    return NextResponse.json(
      { message: error.body || 'Workspace proxy request failed' },
      { status: error.status },
    );
  }

  return NextResponse.json(
    { message: 'Workspace proxy request failed' },
    { status: 500 },
  );
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
