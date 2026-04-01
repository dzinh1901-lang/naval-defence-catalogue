import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record an immutable audit event.
   *
   * @param action  Verb describing what happened (e.g. 'CREATE', 'UPDATE', 'DELETE').
   * @param entity  Prisma model name (e.g. 'Project', 'DigitalTwin').
   * @param entityId  Primary key of the affected record.
   * @param actorId   userId of the authenticated user performing the action.
   * @param metadata  Optional key/value context (e.g. field diffs, from/to status).
   */
  log(
    action: string,
    entity: string,
    entityId: string,
    actorId: string,
    metadata: Record<string, unknown> = {},
  ) {
    return this.prisma.auditEvent.create({
      data: {
        action,
        entity,
        entityId,
        actorId,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
  }
}
