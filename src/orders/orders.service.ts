import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(
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
    const normalizedStatus = this.parseOrderStatus(options?.status);
    const where: Prisma.OrderWhereInput = {
      storeId,
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
      ...(options?.q
        ? {
            OR: [
              { code: { contains: options.q, mode: 'insensitive' } },
              { customerName: { contains: options.q, mode: 'insensitive' } },
              { customerEmail: { contains: options.q, mode: 'insensitive' } },
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
    const orderBy = this.orderSort(options?.sort);
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const items = rows.map((order) => ({
      ...order,
      rawStatus: order.status,
      status: this.toUiStatus(order.status),
    }));

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(storeId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        items: true,
        shipment: true,
        paymentTxns: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return {
      ...order,
      rawStatus: order.status,
      status: this.toUiStatus(order.status),
    };
  }

  async updateStatus(
    storeId: string,
    orderId: string,
    status: string,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.order.findFirst({
      where: { id: orderId, storeId },
    });
    if (!existing) throw new NotFoundException('Order not found');

    const normalizedStatus = this.parseOrderStatus(status, true);

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: normalizedStatus! },
      include: { items: true },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'order.status.update',
      entityType: 'Order',
      entityId: orderId,
      metaJson: { status: normalizedStatus },
    });

    return {
      ...order,
      rawStatus: order.status,
      status: this.toUiStatus(order.status),
    };
  }

  private parseOrderStatus(value?: string, strict = false): OrderStatus | undefined {
    if (!value) return undefined;
    const raw = String(value).trim().toLowerCase();
    if (raw === 'completed') return OrderStatus.delivered;

    const valid = Object.values(OrderStatus).find(
      (item) => item.toLowerCase() === raw,
    );
    if (valid) return valid;

    if (strict) {
      throw new BadRequestException(
        'Invalid order status. Use pending/paid/processing/shipped/delivered/completed/cancelled',
      );
    }
    return undefined;
  }

  private toUiStatus(status: OrderStatus) {
    if (status === OrderStatus.delivered) return 'completed';
    return status;
  }

  private orderSort(sort?: string): Prisma.OrderOrderByWithRelationInput {
    const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
    if (key === 'createdat_asc') return { createdAt: 'asc' };
    if (key === 'total_desc') return { total: 'desc' };
    if (key === 'total_asc') return { total: 'asc' };
    if (key === 'status_asc') return { status: 'asc' };
    if (key === 'status_desc') return { status: 'desc' };
    return { createdAt: 'desc' };
  }
}
