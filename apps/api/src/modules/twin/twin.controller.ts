import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TwinService } from './twin.service';

@Controller('twins')
export class TwinController {
  constructor(private service: TwinService) {}

  @Post()
  create(@Body() body: { name: string; projectId: string }) {
    return this.service.create(body);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }
}
