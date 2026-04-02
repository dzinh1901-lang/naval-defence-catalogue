import { Controller, Get, Res, Version } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

const fallbackVersion = '0.1.0';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  private async getDatabaseStatus(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'error';
    }
  }

  private getRuntimeMetadata() {
    return {
      environment: process.env['NODE_ENV'] ?? 'development',
      pid: process.pid,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      version: process.env['npm_package_version'] ?? fallbackVersion,
    };
  }

  @Get()
  @Version('1')
  async check() {
    const dbStatus = await this.getDatabaseStatus();

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      signal: 'ready',
      services: {
        api: 'ok',
        database: dbStatus,
      },
      ...this.getRuntimeMetadata(),
    };
  }

  @Get('live')
  @Version('1')
  live() {
    return {
      status: 'ok',
      signal: 'live',
      services: {
        api: 'ok',
      },
      ...this.getRuntimeMetadata(),
    };
  }

  @Get('ready')
  @Version('1')
  async ready(@Res({ passthrough: true }) response: Response) {
    const dbStatus = await this.getDatabaseStatus();
    // Keep the structured readiness payload while still returning a probe-friendly 503 on failure.
    if (dbStatus !== 'ok') {
      response.status(503);
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'not-ready',
      signal: 'ready',
      services: {
        api: 'ok',
        database: dbStatus,
      },
      ...this.getRuntimeMetadata(),
    };
  }
}
