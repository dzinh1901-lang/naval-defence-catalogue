import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(action: string, entity: string, entityId: string, userId: string) {
    return this.prisma.$executeRawUnsafe(
      `INSERT INTO \"AuditLog\" (id, action, entity, entityId, userId, \"createdAt\") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
      action,
      entity,
      entityId,
      userId
    );
  }
}
