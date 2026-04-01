import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { CreateSimulationRunDto, UpdateSimulationRunDto } from './dto/simulation-run.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types/request-user.type';

@Controller('simulations')
export class SimulationController {
  constructor(private readonly service: SimulationService) {}

  /**
   * POST /api/v1/simulations
   * Create a new simulation definition for a digital twin.
   * Requires MEMBER or ADMIN role.
   */
  @Post()
  @Roles('MEMBER', 'ADMIN')
  create(@Body() dto: CreateSimulationDto) {
    return this.service.create(dto);
  }

  /**
   * GET /api/v1/simulations/twin/:twinId
   * List all simulations for a digital twin.
   */
  @Get('twin/:twinId')
  findByTwin(@Param('twinId') twinId: string) {
    return this.service.findByTwin(twinId);
  }

  /**
   * GET /api/v1/simulations/:id
   * Get a simulation with its run history.
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.service.findOne(id, user.organizationId);
  }

  /**
   * POST /api/v1/simulations/:id/runs
   * Trigger a new simulation run.
   * Requires MEMBER or ADMIN role.
   */
  @Post(':id/runs')
  @Roles('MEMBER', 'ADMIN')
  createRun(
    @Param('id') simulationId: string,
    @Body() dto: CreateSimulationRunDto,
    @CurrentUser() user: RequestUser,
  ) {
    // Populate requestedById from the authenticated user if not provided.
    const runDto: CreateSimulationRunDto = {
      ...dto,
      requestedById: dto.requestedById ?? user.userId,
    };
    return this.service.createRun(simulationId, user.organizationId, runDto);
  }

  /**
   * GET /api/v1/simulations/:id/runs
   * List all runs for a simulation.
   */
  @Get(':id/runs')
  findRuns(@Param('id') simulationId: string) {
    return this.service.findRunsBySimulation(simulationId);
  }

  /**
   * GET /api/v1/simulations/:id/runs/:runId
   * Get a single simulation run.
   */
  @Get(':id/runs/:runId')
  findOneRun(@Param('id') simulationId: string, @Param('runId') runId: string) {
    return this.service.findOneRun(simulationId, runId);
  }

  /**
   * PATCH /api/v1/simulations/:id/runs/:runId
   * Cancel a pending or running simulation run.
   * Requires MEMBER or ADMIN role.
   */
  @Patch(':id/runs/:runId')
  @Roles('MEMBER', 'ADMIN')
  updateRun(
    @Param('id') simulationId: string,
    @Param('runId') runId: string,
    @Body() dto: UpdateSimulationRunDto,
  ) {
    return this.service.updateRun(simulationId, runId, dto);
  }
}
