import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async send(
    storeId: string,
    data: {
      channel: 'email' | 'sms' | 'whatsapp';
      recipient: string;
      templateKey?: string;
      payload?: Record<string, unknown>;
    },
    actor: { id: string; role: Role },
  ) {
    const log = await this.prisma.notificationLog.create({
      data: {
        storeId,
        channel: data.channel,
        recipient: data.recipient,
        templateKey: data.templateKey,
        payload: data.payload as Prisma.InputJsonValue | undefined,
        status: 'queued',
      },
    });

    const delivered = await this.prisma.notificationLog.update({
      where: { id: log.id },
      data: { status: 'sent' },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'notification.send',
      entityType: 'NotificationLog',
      entityId: log.id,
    });
    return delivered;
  }

  async logs(
    storeId: string,
    options?: {
      page?: number;
      limit?: number;
      q?: string;
      status?: string;
      from?: string;
      to?: string;
      sort?: string;
    },
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
    const where: Prisma.NotificationLogWhereInput = {
      storeId,
      ...(options?.status ? { status: options.status } : {}),
      ...(options?.q
        ? {
            OR: [
              { channel: { contains: options.q, mode: 'insensitive' } },
              { recipient: { contains: options.q, mode: 'insensitive' } },
              { templateKey: { contains: options.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(options?.from || options?.to
        ? {
            createdAt: {
              ...(options?.from ? { gte: new Date(options.from) } : {}),
              ...(options?.to ? { lte: new Date(options.to) } : {}),
            },
          }
        : {}),
    };
    const skip = (page - 1) * limit;
    const orderBy = this.logSort(options?.sort);

    const [items, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.notificationLog.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  private logSort(sort?: string): Prisma.NotificationLogOrderByWithRelationInput {
    const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
    if (key === 'createdat_asc') return { createdAt: 'asc' };
    if (key === 'status_asc') return { status: 'asc' };
    if (key === 'status_desc') return { status: 'desc' };
    if (key === 'channel_asc') return { channel: 'asc' };
    if (key === 'channel_desc') return { channel: 'desc' };
    return { createdAt: 'desc' };
  }
}
