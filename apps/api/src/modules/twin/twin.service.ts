import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TwinService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; projectId: string }) {
    return this.prisma.digitalTwin.create({ data });
  }

  findByProject(projectId: string) {
    return this.prisma.digitalTwin.findMany({ where: { projectId }, include: { subsystems: true } });
  }
}
