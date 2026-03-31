import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RequirementService } from './requirement.service';

@Controller('requirements')
export class RequirementController {
  constructor(private service: RequirementService) {}

  @Post()
  create(@Body() body: { text: string; projectId: string }) {
    return this.service.create(body);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }
}
