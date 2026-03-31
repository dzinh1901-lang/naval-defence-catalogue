import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RequirementService {
  constructor(private prisma: PrismaService) {}

  create(data: { text: string; projectId: string }) {
    return this.prisma.requirement.create({ data });
  }

  findByProject(projectId: string) {
    return this.prisma.requirement.findMany({ where: { projectId } });
  }
}
