import { Injectable, NotFoundException } from '@nestjs/common';
import { SubsystemStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubsystemDto, UpdateSubsystemDto } from './dto/subsystem.dto';

@Injectable()
export class SubsystemService {
  constructor(private readonly prisma: PrismaService) {}

  async findByTwin(twinId: string) {
    return this.prisma.subsystem.findMany({
      where: { twinId },
      include: {
        children: {
          include: {
            children: true,
            interfaces: true,
          },
        },
        interfaces: true,
      },
      orderBy: [{ depth: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, organizationId: string) {
    const subsystem = await this.prisma.subsystem.findFirst({
      where: { id, twin: { project: { organizationId } } },
      include: {
        parent: true,
        children: { include: { interfaces: true } },
        interfaces: true,
        requirements: { orderBy: { identifier: 'asc' } },
      },
    });

    if (!subsystem) {
      throw new NotFoundException(`Subsystem ${id} not found`);
    }
    return subsystem;
  }

  async create(dto: CreateSubsystemDto) {
    let depth = 0;
    if (dto.parentId) {
      const parent = await this.prisma.subsystem.findUnique({ where: { id: dto.parentId } });
      depth = (parent?.depth ?? 0) + 1;
    }

    return this.prisma.subsystem.create({
      data: {
        name: dto.name,
        identifier: dto.identifier,
        description: dto.description ?? null,
        twinId: dto.twinId,
        parentId: dto.parentId ?? null,
        depth,
      },
    });
  }

  async update(id: string, organizationId: string, dto: UpdateSubsystemDto) {
    await this.findOne(id, organizationId);
    return this.prisma.subsystem.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.status !== undefined ? { status: dto.status as SubsystemStatus } : {}),
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.subsystem.delete({ where: { id } });
  }
}
