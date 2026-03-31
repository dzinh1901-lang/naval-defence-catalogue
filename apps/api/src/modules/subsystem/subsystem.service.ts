import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: string) {
    const subsystem = await this.prisma.subsystem.findUnique({
      where: { id },
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
        description: dto.description,
        twinId: dto.twinId,
        parentId: dto.parentId,
        depth,
      },
    });
  }

  async update(id: string, dto: UpdateSubsystemDto) {
    await this.findOne(id);
    return this.prisma.subsystem.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.subsystem.delete({ where: { id } });
  }
}
