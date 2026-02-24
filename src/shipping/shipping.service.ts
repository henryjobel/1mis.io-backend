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
    return this.normalizeConfig(config?.valueJson);
  }

  async upsertConfig(
    storeId: string,
    data: {
      methods?: {
        standard?: boolean;
        express?: boolean;
        pickup?: boolean;
        cod?: boolean;
      };
      charges?: { flatCharge?: number; expressCharge?: number };
      rates?: Array<{ name: string; country: string; amount: number }>;
    },
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.platformSetting.findUnique({
      where: { key: `shipping_config:${storeId}` },
    });
    const base = this.normalizeConfig(existing?.valueJson);
    const incoming = this.normalizeConfig(data as Prisma.JsonValue);
    const normalized = {
      methods: data.methods ? incoming.methods : base.methods,
      charges: data.charges ? incoming.charges : base.charges,
      rates: data.rates !== undefined ? incoming.rates : base.rates,
    };

    const saved = await this.prisma.platformSetting.upsert({
      where: { key: `shipping_config:${storeId}` },
      create: {
        key: `shipping_config:${storeId}`,
        valueJson: normalized as Prisma.InputJsonValue,
      },
      update: { valueJson: normalized as Prisma.InputJsonValue },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'shipping.config.upsert',
      entityType: 'PlatformSetting',
      entityId: saved.key,
    });
    return normalized;
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

  async shipments(
    storeId: string,
    options?: {
      page?: number;
      limit?: number;
      q?: string;
      status?: string;
      sort?: string;
      from?: string;
      to?: string;
    },
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
    const where: Prisma.ShipmentWhereInput = {
      storeId,
      ...(options?.status ? { status: options.status } : {}),
      ...(options?.from || options?.to
        ? {
            createdAt: {
              ...(options?.from ? { gte: new Date(options.from) } : {}),
              ...(options?.to ? { lte: new Date(options.to) } : {}),
            },
          }
        : {}),
      ...(options?.q
        ? {
            OR: [
              { courier: { contains: options.q, mode: 'insensitive' } },
              {
                trackingNumber: {
                  contains: options.q,
                  mode: 'insensitive',
                },
              },
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
    };
    const orderBy = this.shipmentSort(options?.sort);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where,
        include: { order: true },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.shipment.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async orders(
    storeId: string,
    options?: {
      page?: number;
      limit?: number;
      q?: string;
      status?: string;
      sort?: string;
      from?: string;
      to?: string;
    },
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
    const normalizedStatus = this.parseOrderStatus(options?.status);
    const where: Prisma.OrderWhereInput = {
      storeId,
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
      ...(options?.from || options?.to
        ? {
            createdAt: {
              ...(options?.from ? { gte: new Date(options.from) } : {}),
              ...(options?.to ? { lte: new Date(options.to) } : {}),
            },
          }
        : {}),
      ...(options?.q
        ? {
            OR: [
              { code: { contains: options.q, mode: 'insensitive' } },
              { customerName: { contains: options.q, mode: 'insensitive' } },
              { customerEmail: { contains: options.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const skip = (page - 1) * limit;
    const orderBy = this.orderSort(options?.sort);

    const [orders, total, deliveryRows] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          shipment: true,
          items: { select: { productId: true, productNameSnapshot: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
      this.prisma.platformSetting.findMany({
        where: { key: { startsWith: `product_delivery:${storeId}:` } },
      }),
    ]);

    const deliveryMap = new Map<string, boolean>();
    for (const row of deliveryRows) {
      const productId = row.key.replace(`product_delivery:${storeId}:`, '');
      const payload = this.asRecord(row.valueJson);
      deliveryMap.set(productId, this.asBoolean(payload.enabled, true));
    }

    const items = orders.map((order) => {
      const productIds = order.items
        .map((item) => item.productId)
        .filter((id): id is string => Boolean(id));
      const blockedIds = productIds.filter(
        (productId) => deliveryMap.get(productId) === false,
      );
      const deliveryEligible = blockedIds.length === 0;

      return {
        id: order.id,
        code: order.code,
        status: this.toUiStatus(order.status),
        rawStatus: order.status,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        createdAt: order.createdAt,
        shipment: order.shipment,
        delivery: {
          eligible: deliveryEligible,
          blockedProductIds: blockedIds,
        },
      };
    });

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async shipment(storeId: string, shipmentId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: { id: shipmentId, storeId },
      include: { order: { include: { items: true, paymentTxns: true } } },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  private normalizeConfig(value: Prisma.JsonValue | null | undefined) {
    const payload = this.asRecord(value);
    const methods = this.asRecord(payload.methods as Prisma.JsonValue | undefined);
    const charges = this.asRecord(payload.charges as Prisma.JsonValue | undefined);
    const ratesRaw = Array.isArray(payload.rates) ? payload.rates : [];
    const rates = ratesRaw
      .map((item) =>
        this.asRecord(item as Prisma.JsonValue | undefined),
      )
      .filter(
        (item) =>
          this.asString(item.name, '') &&
          this.asString(item.country, '') &&
          Number.isFinite(Number(item.amount)),
      )
      .map((item) => ({
        name: this.asString(item.name, ''),
        country: this.asString(item.country, ''),
        amount: Number(item.amount),
      }));

    return {
      methods: {
        standard: this.asBoolean(methods.standard, true),
        express: this.asBoolean(methods.express, false),
        pickup: this.asBoolean(methods.pickup, true),
        cod: this.asBoolean(methods.cod, true),
      },
      charges: {
        flatCharge: this.asNumber(charges.flatCharge, 0),
        expressCharge: this.asNumber(charges.expressCharge, 0),
      },
      rates,
    };
  }

  private shipmentSort(sort?: string): Prisma.ShipmentOrderByWithRelationInput {
    const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
    if (key === 'createdat_asc') return { createdAt: 'asc' };
    if (key === 'status_asc') return { status: 'asc' };
    if (key === 'status_desc') return { status: 'desc' };
    return { createdAt: 'desc' };
  }

  private orderSort(sort?: string): Prisma.OrderOrderByWithRelationInput {
    const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
    if (key === 'createdat_asc') return { createdAt: 'asc' };
    if (key === 'total_desc') return { total: 'desc' };
    if (key === 'total_asc') return { total: 'asc' };
    return { createdAt: 'desc' };
  }

  private parseOrderStatus(value?: string): OrderStatus | undefined {
    if (!value) return undefined;
    const raw = String(value).trim().toLowerCase();
    if (raw === 'completed') return OrderStatus.delivered;
    return Object.values(OrderStatus).find((status) => status === raw);
  }

  private toUiStatus(status: OrderStatus) {
    if (status === OrderStatus.delivered) return 'completed';
    return status;
  }

  private asRecord(
    value: Prisma.JsonValue | null | undefined,
  ): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return value as Record<string, unknown>;
  }

  private asString(value: unknown, fallback: string) {
    if (typeof value !== 'string') return fallback;
    const next = value.trim();
    return next || fallback;
  }

  private asNumber(value: unknown, fallback: number) {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
  }

  private asBoolean(value: unknown, fallback: boolean) {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return fallback;
  }
}
