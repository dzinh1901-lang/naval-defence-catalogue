import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { SubsystemService } from './subsystem.service';
import { CreateSubsystemDto, UpdateSubsystemDto } from './dto/subsystem.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types/request-user.type';

@Controller('subsystems')
export class SubsystemController {
  constructor(private readonly service: SubsystemService) {}

  @Get()
  @Version('1')
  findByTwin(@Query('twinId') twinId: string) {
    return this.service.findByTwin(twinId);
  }

  @Get(':id')
  @Version('1')
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.service.findOne(id, user.organizationId);
  }

  @Post()
  @Version('1')
  @Roles('MEMBER', 'ADMIN')
  create(@Body() dto: CreateSubsystemDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Version('1')
  @Roles('MEMBER', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateSubsystemDto, @CurrentUser() user: RequestUser) {
    return this.service.update(id, user.organizationId, dto);
  }

  @Delete(':id')
  @Version('1')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.service.remove(id, user.organizationId);
  }
}
