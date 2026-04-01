import { Module } from '@nestjs/common';
import { VariantController } from './variant.controller';
import { VariantService } from './variant.service';

@Module({
  controllers: [VariantController],
  providers: [VariantService],
})
export class VariantModule {}
