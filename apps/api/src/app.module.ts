import { Module } from '@nestjs/common';
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
  ],
})
export class AppModule {}
