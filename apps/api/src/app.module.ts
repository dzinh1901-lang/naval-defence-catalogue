import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { ProjectModule } from './modules/project/project.module';
import { TwinModule } from './modules/twin/twin.module';
import { SubsystemModule } from './modules/subsystem/subsystem.module';
import { RequirementModule } from './modules/requirement/requirement.module';
import { ReviewModule } from './modules/review/review.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { AuthModule } from './modules/auth/auth.module';
import { VariantModule } from './modules/variant/variant.module';
import { SimulationModule } from './modules/simulation/simulation.module';
import { IntelligenceModule } from './modules/intelligence/intelligence.module';
import { AuditModule } from './modules/audit/audit.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false, // handled by HttpLoggerMiddleware
        quietReqLogger: true,
        ...(process.env['NODE_ENV'] !== 'production' && {
          transport: { target: 'pino-pretty', options: { colorize: true, singleLine: true } },
        }),
        serializers: {
          req: (req: { method: string; url: string }) => ({
            method: req.method,
            url: req.url,
          }),
          res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
        },
      },
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    ProjectModule,
    TwinModule,
    SubsystemModule,
    RequirementModule,
    ReviewModule,
    EvidenceModule,
    VariantModule,
    SimulationModule,
    IntelligenceModule,
    AuditModule,
    WorkspaceModule,
  ],
  providers: [
    // Global authentication guard — runs on every request.
    { provide: APP_GUARD, useClass: AuthGuard },
    // Global RBAC guard — enforces @Roles(...) decorators.
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
