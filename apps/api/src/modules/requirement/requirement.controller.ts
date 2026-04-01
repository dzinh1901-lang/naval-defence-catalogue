import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RequirementService } from './requirement.service';

@Controller('requirements')
export class RequirementController {
  constructor(private readonly service: RequirementService) {}

  /**
   * POST /api/v1/requirements
   */
  @Post()
  create(@Body() body: { identifier: string; text: string; projectId: string }) {
    return this.service.create(body);
  }

  /**
   * GET /api/v1/requirements/project/:projectId?subsystemId=...
   * List requirements for a project, optionally filtered by subsystem.
   */
  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @Query('subsystemId') subsystemId?: string,
  ) {
    return this.service.findByProject(projectId, subsystemId);
  }
}
