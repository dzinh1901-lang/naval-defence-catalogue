import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
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
  ],
  providers: [
    // Global authentication guard — runs on every request.
    { provide: APP_GUARD, useClass: AuthGuard },
    // Global RBAC guard — enforces @Roles(...) decorators.
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
