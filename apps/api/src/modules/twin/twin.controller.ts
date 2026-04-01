import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { TwinService } from './twin.service';
import { CreateTwinDto } from './dto/create-twin.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('twins')
export class TwinController {
  constructor(private readonly service: TwinService) {}

  /**
   * POST /api/v1/twins
   * Create a new digital twin. Requires MEMBER or ADMIN role.
   */
  @Post()
  @Roles('MEMBER', 'ADMIN')
  create(@Body() dto: CreateTwinDto) {
    return this.service.create(dto);
  }

  /**
   * GET /api/v1/twins/project/:projectId
   * List all digital twins for a project.
   */
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }

  /**
   * GET /api/v1/twins/:id
   * Get a single digital twin by ID with subsystems, variants, and simulations.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const twin = await this.service.findOne(id);
    if (!twin) throw new NotFoundException(`DigitalTwin ${id} not found`);
    return twin;
  }
}
