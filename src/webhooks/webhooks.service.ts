import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
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

  async receivePayment(
    provider: 'stripe' | 'sslcommerz',
    data: {
      eventType?: string;
      transactionId?: string;
      providerRef?: string;
      orderId?: string;
      status?: string;
      storeId?: string;
      payload?: Record<string, unknown>;
    },
    secret?: string,
  ) {
    const configuredSecret = this.configService.get<string>('WEBHOOK_SECRET');
    const valid = !configuredSecret || configuredSecret === secret;
    const status = this.normalizeWebhookStatus(data.status ?? data.eventType);
    const payload = data.payload ?? {};
    const eventType = String(data.eventType ?? '').trim() || status;
    const baseKey = `webhook:${provider}:${Date.now()}:${Math.random().toString(16).slice(2, 10)}`;

    const targetTx = valid
      ? await this.findPaymentTransaction(provider, data)
      : null;
    let updatedTransactionId: string | null = null;
    let updatedOrderId: string | null = null;
    let processed = false;

    if (targetTx && status) {
      const nextMetadata = {
        ...(targetTx.metadata as Record<string, unknown> | null),
        webhook: {
          provider,
          status,
          eventType,
          receivedAt: new Date().toISOString(),
          payload,
        },
      };

      const updatedTx = await this.prisma.paymentTransaction.update({
        where: { id: targetTx.id },
        data: {
          status,
          providerRef: data.providerRef ?? targetTx.providerRef,
          metadata: nextMetadata as Prisma.InputJsonValue,
        },
      });
      updatedTransactionId = updatedTx.id;
      updatedOrderId = updatedTx.orderId;
      processed = true;

      if (updatedTx.orderId) {
        const orderStatus = this.toOrderStatus(status);
        if (orderStatus) {
          await this.prisma.order.update({
            where: { id: updatedTx.orderId },
            data: { status: orderStatus },
          });
        }
      }
    }

    await this.prisma.platformSetting.create({
      data: {
        key: baseKey,
        valueJson: {
          provider,
          valid,
          processed,
          eventType,
          status,
          storeId: data.storeId ?? targetTx?.storeId ?? null,
          transactionId: updatedTransactionId,
          orderId: updatedOrderId,
          payload,
          receivedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
    });

    await this.auditService.log({
      role: Role.support,
      action: `webhook.${provider}.received`,
      entityType: 'PlatformSetting',
      entityId: baseKey,
      metaJson: {
        valid,
        processed,
        transactionId: updatedTransactionId,
      },
    });

    return {
      accepted: valid,
      processed,
      provider,
      status,
      transactionId: updatedTransactionId,
      orderId: updatedOrderId,
    };
  }

  private async findPaymentTransaction(
    provider: 'stripe' | 'sslcommerz',
    data: {
      transactionId?: string;
      providerRef?: string;
      orderId?: string;
      storeId?: string;
    },
  ) {
    if (data.transactionId) {
      return this.prisma.paymentTransaction.findFirst({
        where: {
          id: data.transactionId,
          provider,
          ...(data.storeId ? { storeId: data.storeId } : {}),
        },
      });
    }
    if (data.providerRef) {
      return this.prisma.paymentTransaction.findFirst({
        where: {
          providerRef: data.providerRef,
          provider,
          ...(data.storeId ? { storeId: data.storeId } : {}),
        },
      });
    }
    if (data.orderId) {
      return this.prisma.paymentTransaction.findFirst({
        where: {
          orderId: data.orderId,
          provider,
          ...(data.storeId ? { storeId: data.storeId } : {}),
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    return null;
  }

  private normalizeWebhookStatus(raw?: string) {
    const value = String(raw ?? '').trim().toLowerCase();
    if (!value) return 'pending';
    if (
      value === 'succeeded' ||
      value === 'paid' ||
      value === 'success' ||
      value === 'completed' ||
      value === 'captured'
    ) {
      return 'succeeded';
    }
    if (value === 'processing' || value === 'requires_capture') {
      return 'processing';
    }
    if (
      value === 'failed' ||
      value === 'cancelled' ||
      value === 'canceled' ||
      value === 'declined' ||
      value === 'expired'
    ) {
      return 'failed';
    }
    if (value === 'refunded') return 'refunded';
    if (value === 'pending') return 'pending';
    return 'pending';
  }

  private toOrderStatus(paymentStatus: string): OrderStatus | null {
    if (paymentStatus === 'succeeded') return OrderStatus.paid;
    if (paymentStatus === 'refunded') return OrderStatus.cancelled;
    if (paymentStatus === 'failed') return OrderStatus.cancelled;
    return null;
  }
}
