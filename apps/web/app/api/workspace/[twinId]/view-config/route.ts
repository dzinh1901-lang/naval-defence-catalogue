import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import {
  ApiClientError,
  getWorkspaceViewConfig,
  updateWorkspaceViewConfig,
} from '@/lib/api';

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
}
