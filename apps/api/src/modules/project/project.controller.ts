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

@Controller('projects')
export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  /**
   * POST /api/v1/projects
   * Create a new project.
   */
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.service.create(dto);
  }

  /**
   * GET /api/v1/projects?organizationId=...&status=...
   * List all projects, optionally filtered by org and/or status.
   */
  @Get()
  findAll(
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: string,
  ) {
    const filters: { organizationId?: string; status?: string } = {};
    if (organizationId) filters.organizationId = organizationId;
    if (status) filters.status = status;
    return this.service.findAll(filters);
  }

  /**
   * GET /api/v1/projects/:id
   * Get a single project by ID, including its digital twins.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const project = await this.service.findOne(id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }
}
