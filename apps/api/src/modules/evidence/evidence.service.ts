import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEvidenceDto) {
    return this.prisma.evidence.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        type: (dto.type ?? 'DOCUMENT') as never,
        uri: dto.uri,
        reviewId: dto.reviewId,
      },
    });
  }

  findByReview(reviewId: string) {
    return this.prisma.evidence.findMany({
      where: { reviewId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
