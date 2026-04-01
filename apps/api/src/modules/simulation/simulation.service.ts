import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateSimulationDto } from './dto/create-simulation.dto';
import type { CreateSimulationRunDto, UpdateSimulationRunDto } from './dto/simulation-run.dto';

@Injectable()
export class SimulationService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Simulations ────────────────────────────────────────────────────────────

  create(dto: CreateSimulationDto) {
    return this.prisma.simulation.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        type: (dto.type ?? 'STATIC') as 'STATIC' | 'DYNAMIC' | 'MONTE_CARLO',
        config: dto.config ?? {},
        twinId: dto.twinId,
      },
    });
  }

  findByTwin(twinId: string) {
    return this.prisma.simulation.findMany({
      where: { twinId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const sim = await this.prisma.simulation.findFirst({
      where: { id, twin: { project: { organizationId } } },
      include: {
        runs: {
          orderBy: { createdAt: 'desc' },
          include: {
            requestedBy: { select: { id: true, email: true, name: true } },
          },
        },
      },
    });
    if (!sim) throw new NotFoundException(`Simulation ${id} not found`);
    return sim;
  }

  // ── Simulation Runs ────────────────────────────────────────────────────────

  async createRun(simulationId: string, organizationId: string, dto: CreateSimulationRunDto) {
    // Verify the simulation exists and belongs to the requesting tenant.
    await this.findOne(simulationId, organizationId);

    return this.prisma.simulationRun.create({
      data: {
        status: 'PENDING',
        simulationId,
        requestedById: dto.requestedById ?? null,
      },
      include: {
        requestedBy: { select: { id: true, email: true, name: true } },
      },
    });
  }

  findRunsBySimulation(simulationId: string) {
    return this.prisma.simulationRun.findMany({
      where: { simulationId },
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async findOneRun(simulationId: string, runId: string) {
    const run = await this.prisma.simulationRun.findFirst({
      where: { id: runId, simulationId },
      include: {
        requestedBy: { select: { id: true, email: true, name: true } },
        simulation: { select: { id: true, name: true, type: true, twinId: true } },
      },
    });
    if (!run) throw new NotFoundException(`SimulationRun ${runId} not found`);
    return run;
  }

  async updateRun(simulationId: string, runId: string, dto: UpdateSimulationRunDto) {
    const run = await this.findOneRun(simulationId, runId);

    // Only PENDING or RUNNING runs can be cancelled.
    if (!['PENDING', 'RUNNING'].includes(run.status)) {
      throw new BadRequestException(
        `Cannot cancel run in status ${run.status}. Only PENDING or RUNNING runs can be cancelled.`,
      );
    }

    return this.prisma.simulationRun.update({
      where: { id: runId },
      data: { status: dto.status },
      include: {
        requestedBy: { select: { id: true, email: true, name: true } },
      },
    });
  }
}
