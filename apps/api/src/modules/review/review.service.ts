import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  create(data: { title: string; projectId: string }) {
    return this.prisma.review.create({ data });
  }

  findByProject(projectId: string) {
    return this.prisma.review.findMany({ where: { projectId }, include: { evidence: true } });
  }
}
