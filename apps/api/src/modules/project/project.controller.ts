import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types/request-user.type';

@Controller('projects')
export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  /**
   * POST /api/v1/projects
   * Create a new project. Requires MEMBER or ADMIN role.
   */
  @Post()
  @Roles('MEMBER', 'ADMIN')
  create(@Body() dto: CreateProjectDto) {
    return this.service.create(dto);
  }

  /**
   * GET /api/v1/projects?status=...
   * List all projects scoped to the authenticated user's organization.
   */
  @Get()
  findAll(
    @CurrentUser() user: RequestUser,
    @Query('status') status?: string,
  ) {
    const filters: { organizationId: string; status?: string } = {
      organizationId: user.organizationId,
    };
    if (status) filters.status = status;
    return this.service.findAll(filters);
  }

  /**
   * GET /api/v1/projects/:id
   * Get a single project by ID, scoped to the authenticated user's organization.
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const project = await this.service.findOne(id, user.organizationId);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }
}
