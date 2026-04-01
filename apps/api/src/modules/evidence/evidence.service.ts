import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { title: string; reviewId: string; uri: string }) {
    return this.prisma.evidence.create({ data });
  }

  findByReview(reviewId: string) {
    return this.prisma.evidence.findMany({ where: { reviewId } });
  }
}
