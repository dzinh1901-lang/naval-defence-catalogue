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
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Version('1')
  create(@Body() dto: CreateSubsystemDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Version('1')
  update(@Param('id') id: string, @Body() dto: UpdateSubsystemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Version('1')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
