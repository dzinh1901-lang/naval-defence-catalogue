import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { assertApiRuntimeEnvironment } from './config/runtime-env';
import { AppModule } from './app.module';
import { assertAuthEnvironment } from './modules/auth/auth-env';

async function bootstrap() {
  assertApiRuntimeEnvironment();
  assertAuthEnvironment();
  const app = await NestFactory.create(AppModule, { bufferLogs: true, cors: true });

  // Use structured Pino logger for all NestJS internal log output.
  app.useLogger(app.get(Logger));

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

  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);
  app
    .get(Logger)
    .log(`🚀  Naval DTP API listening on http://localhost:${port}/api/v1`);
}

bootstrap();
