import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EvidenceService {
  constructor(private prisma: PrismaService) {}

  create(data: { reviewId: string; uri: string }) {
    return this.prisma.evidence.create({ data });
  }

  findByReview(reviewId: string) {
    return this.prisma.evidence.findMany({ where: { reviewId } });
  }
}
