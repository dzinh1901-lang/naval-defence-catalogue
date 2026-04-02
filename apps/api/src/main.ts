import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { assertApiRuntimeEnvironment, formatDatabaseTarget } from './config/runtime-env';
import { AppModule } from './app.module';
import { assertAuthEnvironment } from './modules/auth/auth-env';

async function bootstrap() {
  const runtimeConfig = assertApiRuntimeEnvironment();
  assertAuthEnvironment();
  const app = await NestFactory.create(AppModule, { bufferLogs: true, cors: true });

  // Use structured Pino logger for all NestJS internal log output.
  app.useLogger(app.get(Logger));
  const logger = app.get(Logger);

  logger.log(
    `API startup checks passed ${JSON.stringify({
      environment: process.env['NODE_ENV'] ?? 'development',
      port: runtimeConfig.port,
      databaseTarget: formatDatabaseTarget(runtimeConfig.databaseUrl),
      bootstrapAuthEnabled: Boolean(process.env['AUTH_BOOTSTRAP_SECRET']?.trim()),
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
      apiBaseUrl: `http://localhost:${runtimeConfig.port}/api/v1`,
      healthUrl: `http://localhost:${runtimeConfig.port}/api/v1/health`,
      liveUrl: `http://localhost:${runtimeConfig.port}/api/v1/health/live`,
      readyUrl: `http://localhost:${runtimeConfig.port}/api/v1/health/ready`,
    })}`,
  );
}

bootstrap();
