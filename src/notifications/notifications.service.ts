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

  logs(storeId: string) {
    return this.prisma.notificationLog.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
