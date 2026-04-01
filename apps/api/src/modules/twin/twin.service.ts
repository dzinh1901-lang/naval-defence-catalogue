import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTwinDto } from './dto/create-twin.dto';

@Injectable()
export class TwinService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTwinDto) {
    return this.prisma.digitalTwin.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        projectId: dto.projectId,
      },
    });
  }

  findByProject(projectId: string) {
    return this.prisma.digitalTwin.findMany({
      where: { projectId },
      include: {
        subsystems: {
          where: { parentId: null },
          include: {
            children: {
              include: { children: true, interfaces: true },
            },
            interfaces: true,
          },
          orderBy: [{ depth: 'asc' }, { name: 'asc' }],
        },
        variants: {
          select: {
            id: true,
            name: true,
            description: true,
            isBaseline: true,
            configuration: true,
            twinId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.digitalTwin.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, slug: true, organizationId: true } },
        subsystems: {
          where: { parentId: null },
          include: {
            children: {
              include: { children: true, interfaces: true },
            },
            interfaces: true,
          },
          orderBy: [{ depth: 'asc' }, { name: 'asc' }],
        },
        variants: {
          select: {
            id: true,
            name: true,
            description: true,
            isBaseline: true,
            configuration: true,
            twinId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        simulations: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            twinId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }
}
