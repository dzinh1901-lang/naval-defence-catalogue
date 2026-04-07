import { NextResponse } from 'next/server';
import { ApiClientError, runWorkspaceAgentCollaboration } from '@/lib/api';

interface RouteContext {
  params: Promise<{ twinId: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const { twinId } = await context.params;

  try {
    const payload = await request.json();
    const result = await runWorkspaceAgentCollaboration(twinId, payload);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiClientError) {
      return NextResponse.json(
        { message: error.body || 'Agent collaboration request failed' },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { message: 'Agent collaboration request failed' },
      { status: 500 },
    );
  }
}
