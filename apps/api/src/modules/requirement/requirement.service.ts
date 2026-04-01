import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RequirementService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { identifier: string; text: string; projectId: string }) {
    return this.prisma.requirement.create({ data });
  }

  findByProject(projectId: string, subsystemId?: string) {
    return this.prisma.requirement.findMany({
      where: {
        projectId,
        ...(subsystemId !== undefined ? { subsystemId: subsystemId || null } : {}),
      },
      orderBy: [{ identifier: 'asc' }],
    });
  }
}
