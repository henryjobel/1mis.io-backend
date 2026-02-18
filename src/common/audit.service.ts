import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    actorUserId?: string;
    role?: Role;
    action: string;
    entityType: string;
    entityId: string;
    metaJson?: Record<string, unknown>;
  }) {
    await this.prisma.auditLog.create({
      data: {
        actorUserId: params.actorUserId,
        role: params.role,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metaJson: params.metaJson as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
