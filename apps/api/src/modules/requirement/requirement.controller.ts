import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RequirementService } from './requirement.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('requirements')
export class RequirementController {
  constructor(private readonly service: RequirementService) {}

  /**
   * POST /api/v1/requirements
   * Create a requirement. Requires MEMBER or ADMIN role.
   */
  @Post()
  @Roles('MEMBER', 'ADMIN')
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
