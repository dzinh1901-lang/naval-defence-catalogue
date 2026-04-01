import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        type: (dto.type ?? 'DESIGN') as never,
        projectId: dto.projectId,
        createdById: dto.createdById,
      },
      include: { evidence: true, createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
  }

  findByProject(projectId: string) {
    return this.prisma.review.findMany({
      where: { projectId },
      include: {
        evidence: true,
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        evidence: true,
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }

  async update(id: string, dto: UpdateReviewDto) {
    await this.findOne(id);
    return this.prisma.review.update({
      where: { id },
      data: { ...(dto.status !== undefined && { status: dto.status as never }) },
      include: { evidence: true },
    });
  }
}
