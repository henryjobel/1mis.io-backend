import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShippingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getConfig(storeId: string) {
    const config = await this.prisma.platformSetting.findUnique({
      where: { key: `shipping_config:${storeId}` },
    });
    return config?.valueJson ?? { rates: [] };
  }

  async upsertConfig(
    storeId: string,
    data: { rates: Array<{ name: string; country: string; amount: number }> },
    actor: { id: string; role: Role },
  ) {
    const saved = await this.prisma.platformSetting.upsert({
      where: { key: `shipping_config:${storeId}` },
      create: {
        key: `shipping_config:${storeId}`,
        valueJson: data as Prisma.InputJsonValue,
      },
      update: { valueJson: data as Prisma.InputJsonValue },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'shipping.config.upsert',
      entityType: 'PlatformSetting',
      entityId: saved.key,
    });
    return saved;
  }

  async shipOrder(
    storeId: string,
    data: {
      orderId: string;
      courier: string;
      trackingNumber: string;
      trackingUrl?: string;
      estimatedDelivery?: string;
    },
    actor: { id: string; role: Role },
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: data.orderId, storeId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const shipment = await this.prisma.shipment.upsert({
      where: { orderId: order.id },
      create: {
        storeId,
        orderId: order.id,
        courier: data.courier,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
        estimatedDelivery: data.estimatedDelivery
          ? new Date(data.estimatedDelivery)
          : undefined,
        shippedAt: new Date(),
        status: 'shipped',
      },
      update: {
        courier: data.courier,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
        estimatedDelivery: data.estimatedDelivery
          ? new Date(data.estimatedDelivery)
          : undefined,
        shippedAt: new Date(),
        status: 'shipped',
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.shipped },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'shipping.ship_order',
      entityType: 'Shipment',
      entityId: shipment.id,
    });
    return shipment;
  }

  async updateTracking(
    storeId: string,
    shipmentId: string,
    status: string,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.shipment.findFirst({
      where: { id: shipmentId, storeId },
    });
    if (!existing) throw new NotFoundException('Shipment not found');

    const deliveredAt = status === 'delivered' ? new Date() : null;
    const updated = await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: { status, deliveredAt: deliveredAt ?? undefined },
    });
    if (status === 'delivered') {
      await this.prisma.order.update({
        where: { id: existing.orderId },
        data: { status: OrderStatus.delivered },
      });
    }

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'shipping.tracking.update',
      entityType: 'Shipment',
      entityId: shipmentId,
      metaJson: { status },
    });
    return updated;
  }

  shipments(storeId: string) {
    return this.prisma.shipment.findMany({
      where: { storeId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
