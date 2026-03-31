import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; organizationId: string }) {
    return this.prisma.project.create({ data });
  }

  findAll() {
    return this.prisma.project.findMany({ include: { twins: true } });
  }
}
