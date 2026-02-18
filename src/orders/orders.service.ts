import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  list(storeId: string) {
    return this.prisma.order.findMany({
      where: { storeId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    storeId: string,
    orderId: string,
    status: OrderStatus,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.order.findFirst({
      where: { id: orderId, storeId },
    });
    if (!existing) throw new NotFoundException('Order not found');

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'order.status.update',
      entityType: 'Order',
      entityId: orderId,
      metaJson: { status },
    });

    return order;
  }
}
