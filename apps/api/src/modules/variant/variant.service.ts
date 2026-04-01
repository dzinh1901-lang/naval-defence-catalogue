import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVariantDto) {
    return this.prisma.variant.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        isBaseline: dto.isBaseline ?? false,
        configuration: dto.configuration ?? {},
        twinId: dto.twinId,
      },
    });
  }

  findByTwin(twinId: string) {
    return this.prisma.variant.findMany({
      where: { twinId },
      orderBy: [{ isBaseline: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const variant = await this.prisma.variant.findUnique({ where: { id } });
    if (!variant) throw new NotFoundException(`Variant ${id} not found`);
    return variant;
  }

  async update(id: string, dto: UpdateVariantDto) {
    await this.findOne(id);
    return this.prisma.variant.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isBaseline !== undefined && { isBaseline: dto.isBaseline }),
        ...(dto.configuration !== undefined && { configuration: dto.configuration }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.variant.delete({ where: { id } });
  }
}
