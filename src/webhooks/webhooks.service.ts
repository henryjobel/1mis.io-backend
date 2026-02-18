import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
  ) {}

  async receive(
    channel: 'meta' | 'gtm',
    data: {
      source: string;
      storeId?: string;
      payload: Record<string, unknown>;
    },
    secret?: string,
  ) {
    const configuredSecret = this.configService.get<string>('WEBHOOK_SECRET');
    const valid = !configuredSecret || configuredSecret === secret;

    const key = `webhook:${channel}:${Date.now()}:${Math.random().toString(16).slice(2, 10)}`;
    await this.prisma.platformSetting.create({
      data: {
        key,
        valueJson: {
          source: data.source,
          storeId: data.storeId,
          payload: data.payload,
          receivedAt: new Date().toISOString(),
          valid,
        } as Prisma.InputJsonValue,
      },
    });

    await this.auditService.log({
      role: Role.support,
      action: `webhook.${channel}.received`,
      entityType: 'PlatformSetting',
      entityId: key,
      metaJson: { valid, storeId: data.storeId },
    });

    return { accepted: valid };
  }
}
