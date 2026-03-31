import { Module } from '@nestjs/common';
import { ProjectModule } from './modules/project/project.module';
import { TwinModule } from './modules/twin/twin.module';
import { RequirementModule } from './modules/requirement/requirement.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ProjectModule, TwinModule, RequirementModule],
  providers: [PrismaService],
})
export class AppModule {}
