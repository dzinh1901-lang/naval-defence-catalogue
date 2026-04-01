import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: dto.description ?? null,
        organizationId: dto.organizationId,
      },
      include: { twins: true },
    });
  }

  findAll(filters: { organizationId: string; status?: string }) {
    return this.prisma.project.findMany({
      where: {
        organizationId: filters.organizationId,
        ...(filters.status ? { status: filters.status as never } : {}),
      },
      include: {
        twins: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
            status: true,
            projectId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { requirements: true, reviews: true },
        },
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });
  }

  findOne(id: string, organizationId: string) {
    return this.prisma.project.findFirst({
      where: { id, organizationId },
      include: {
        twins: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
            status: true,
            projectId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { requirements: true, reviews: true },
        },
      },
    });
  }
}
