import { NextResponse } from 'next/server';
import { assertWebRuntimeEnvironment } from '../../../../lib/env';

export async function GET() {
  assertWebRuntimeEnvironment();

  return NextResponse.json({
    status: 'ok',
    signal: 'live',
    service: 'web',
    environment: process.env['NODE_ENV'] ?? 'development',
    timestamp: new Date().toISOString(),
  });
}
