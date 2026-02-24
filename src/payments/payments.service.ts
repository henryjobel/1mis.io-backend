import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getConfig(storeId: string) {
    const config = await this.prisma.platformSetting.findUnique({
      where: { key: `payment_config:${storeId}` },
    });
    return config?.valueJson ?? { provider: 'stripe', mode: 'test' };
  }

  async upsertConfig(
    storeId: string,
    data: Record<string, unknown>,
    actor: { id: string; role: Role },
  ) {
    const setting = await this.prisma.platformSetting.upsert({
      where: { key: `payment_config:${storeId}` },
      create: {
        key: `payment_config:${storeId}`,
        valueJson: data as Prisma.InputJsonValue,
      },
      update: { valueJson: data as Prisma.InputJsonValue },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'payment.config.upsert',
      entityType: 'PlatformSetting',
      entityId: setting.key,
    });
    return setting;
  }

  async createIntent(
    storeId: string,
    data: {
      amount: number;
      orderId?: string;
      provider?: string;
      currency?: string;
    },
    actor: { id: string; role: Role },
  ) {
    const provider = data.provider ?? 'stripe';
    const tx = await this.prisma.paymentTransaction.create({
      data: {
        storeId,
        orderId: data.orderId,
        provider,
        amount: data.amount,
        currency: data.currency ?? 'USD',
        status: 'requires_confirmation',
        metadata: { simulated: true, clientSecret: `pi_${Date.now()}` },
      },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'payment.intent.create',
      entityType: 'PaymentTransaction',
      entityId: tx.id,
    });
    return tx;
  }

  async confirm(
    storeId: string,
    data: { transactionId: string; providerRef: string; status?: string },
    actor: { id: string; role: Role },
  ) {
    const tx = await this.prisma.paymentTransaction.findFirst({
      where: { id: data.transactionId, storeId },
    });
    if (!tx) throw new NotFoundException('Transaction not found');

    const updated = await this.prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: {
        status: data.status ?? 'succeeded',
        providerRef: data.providerRef,
      },
    });

    if (updated.orderId) {
      await this.prisma.order.update({
        where: { id: updated.orderId },
        data: { status: OrderStatus.paid },
      });
    }

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'payment.confirm',
      entityType: 'PaymentTransaction',
      entityId: tx.id,
    });
    return updated;
  }

  async refund(
    storeId: string,
    data: { transactionId: string; amount?: number },
    actor: { id: string; role: Role },
  ) {
    const tx = await this.prisma.paymentTransaction.findFirst({
      where: { id: data.transactionId, storeId },
    });
    if (!tx) throw new NotFoundException('Transaction not found');

    const refunded = await this.prisma.paymentTransaction.create({
      data: {
        storeId,
        orderId: tx.orderId,
        provider: tx.provider,
        amount: data.amount ?? Number(tx.amount),
        currency: tx.currency,
        status: 'refunded',
        providerRef: tx.providerRef,
        metadata: { parentTransactionId: tx.id },
      },
    });

    if (tx.orderId) {
      await this.prisma.order.update({
        where: { id: tx.orderId },
        data: { status: OrderStatus.cancelled },
      });
    }

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'payment.refund',
      entityType: 'PaymentTransaction',
      entityId: refunded.id,
    });
    return refunded;
  }

  async transactions(
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
    const where: Prisma.PaymentTransactionWhereInput = {
      storeId,
      ...(options?.status ? { status: options.status } : {}),
      ...(options?.q
        ? {
            OR: [
              { provider: { contains: options.q, mode: 'insensitive' } },
              { providerRef: { contains: options.q, mode: 'insensitive' } },
              {
                order: {
                  OR: [
                    { code: { contains: options.q, mode: 'insensitive' } },
                    {
                      customerName: {
                        contains: options.q,
                        mode: 'insensitive',
                      },
                    },
                    {
                      customerEmail: {
                        contains: options.q,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
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
    const orderBy = this.transactionSort(options?.sort);

    const [items, total] = await Promise.all([
      this.prisma.paymentTransaction.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              code: true,
              customerName: true,
              customerEmail: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.paymentTransaction.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async transaction(storeId: string, transactionId: string) {
    const tx = await this.prisma.paymentTransaction.findFirst({
      where: { id: transactionId, storeId },
      include: {
        order: {
          include: {
            items: true,
            shipment: true,
          },
        },
      },
    });
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  private transactionSort(
    sort?: string,
  ): Prisma.PaymentTransactionOrderByWithRelationInput {
    const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
    if (key === 'createdat_asc') return { createdAt: 'asc' };
    if (key === 'amount_desc') return { amount: 'desc' };
    if (key === 'amount_asc') return { amount: 'asc' };
    if (key === 'status_asc') return { status: 'asc' };
    if (key === 'status_desc') return { status: 'desc' };
    return { createdAt: 'desc' };
  }
}
