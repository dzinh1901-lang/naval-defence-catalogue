import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { assertApiRuntimeEnvironment, formatDatabaseTarget } from './config/runtime-env';
import { AppModule } from './app.module';
import { assertAuthEnvironment, isBootstrapAuthEnabled } from './modules/auth/auth-env';

async function bootstrap() {
  const runtimeConfig = assertApiRuntimeEnvironment();
  assertAuthEnvironment();
  const app = await NestFactory.create(AppModule, { bufferLogs: true, cors: true });

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Use structured Pino logger for all NestJS internal log output.
  app.useLogger(app.get(Logger));
  const logger = app.get(Logger);

  logger.log(
    `API startup checks passed ${JSON.stringify({
      environment: process.env['NODE_ENV'] ?? 'development',
      port: runtimeConfig.port,
      databaseTarget: formatDatabaseTarget(runtimeConfig.databaseUrl),
      bootstrapAuthConfigured: Boolean(process.env['AUTH_BOOTSTRAP_SECRET']?.trim()),
      bootstrapAuthEnabled: isBootstrapAuthEnabled(),
    })}`,
  );

  // Versioned API prefix: /api/v1/...
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(runtimeConfig.port);
  logger.log(
    `🚀 Naval DTP API listening ${JSON.stringify({
      port: runtimeConfig.port,
      apiBasePath: '/api/v1',
      healthPaths: {
        status: '/api/v1/health',
        live: '/api/v1/health/live',
        ready: '/api/v1/health/ready',
      },
    })}`,
  );
}

bootstrap().catch((error) => {
  console.error(
    JSON.stringify({
      service: 'api',
      status: 'startup-failed',
      message: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(1);
});
