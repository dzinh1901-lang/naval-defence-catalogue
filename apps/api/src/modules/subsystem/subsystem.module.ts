import { Module } from '@nestjs/common';
import { SubsystemController } from './subsystem.controller';
import { SubsystemService } from './subsystem.service';

@Module({
  controllers: [SubsystemController],
  providers: [SubsystemService],
})
export class SubsystemModule {}
