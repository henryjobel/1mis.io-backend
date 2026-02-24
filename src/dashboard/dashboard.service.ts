import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(storeId: string) {
    const [
      store,
      orderAgg,
      ordersCount,
      completedOrders,
      customersGrouped,
      lowStockProducts,
      lowStockVariants,
      productsSoldAgg,
      recentOrders,
      domainSetting,
      paymentOps,
      paymentConfig,
    ] = await Promise.all([
      this.prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true, publishedAt: true, slug: true },
      }),
      this.prisma.order.aggregate({
        where: { storeId },
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { storeId } }),
      this.prisma.order.count({
        where: {
          storeId,
          status: {
            in: [
              OrderStatus.paid,
              OrderStatus.processing,
              OrderStatus.shipped,
              OrderStatus.delivered,
            ],
          },
        },
      }),
      this.prisma.order.groupBy({
        by: ['customerEmail'],
        where: { storeId },
      }),
      this.prisma.product.count({
        where: { storeId, status: 'active', stock: { lte: 5 } },
      }),
      this.prisma.productVariant.count({
        where: { stock: { lte: 5 }, product: { storeId, status: 'active' } },
      }),
      this.prisma.orderItem.aggregate({
        where: { order: { storeId } },
        _sum: { qty: true },
      }),
      this.prisma.order.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          code: true,
          customerName: true,
          customerEmail: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.platformSetting.findUnique({
        where: { key: `domain:${storeId}` },
      }),
      this.prisma.platformSetting.findUnique({
        where: { key: `payment_ops:${storeId}` },
      }),
      this.prisma.platformSetting.findUnique({
        where: { key: `payment_config:${storeId}` },
      }),
    ]);

    if (!store) throw new NotFoundException('Store not found');

    const conversionRatePct =
      ordersCount > 0
        ? Number(((completedOrders / ordersCount) * 100).toFixed(2))
        : 0;

    const domainJson = this.asRecord(domainSetting?.valueJson);
    const paymentOpsJson = this.asRecord(paymentOps?.valueJson);
    const paymentConfigJson = this.asRecord(paymentConfig?.valueJson);

    return {
      stats: {
        totalRevenue: Number(orderAgg._sum.total ?? 0),
        orders: ordersCount,
        customers: customersGrouped.length,
        conversionRatePct,
        lowStockAlerts: lowStockProducts + lowStockVariants,
        productsSold: productsSoldAgg._sum.qty ?? 0,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        code: order.code,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: Number(order.total),
        status: this.toUiStatus(order.status),
        rawStatus: order.status,
        createdAt: order.createdAt.toISOString(),
      })),
      website: {
        domain:
          this.asString(domainJson.domain, '') || `${store.slug}.1mis.io`,
        domainStatus: this.asString(domainJson.domainStatus, 'not_connected'),
        sslStatus: this.asString(domainJson.sslStatus, 'inactive'),
        publishedAt: store.publishedAt?.toISOString() ?? null,
      },
      payments: {
        codEnabled: this.asBoolean(
          paymentOpsJson.codEnabled,
          this.asBoolean(paymentConfigJson.codEnabled, true),
        ),
        stripeEnabled: this.asBoolean(
          paymentOpsJson.stripeEnabled,
          this.asBoolean(paymentConfigJson.stripeEnabled, true),
        ),
        sslCommerzEnabled: this.asBoolean(
          paymentOpsJson.sslCommerzEnabled,
          this.asBoolean(paymentConfigJson.sslCommerzEnabled, false),
        ),
        mode: this.normalizeMode(
          paymentOpsJson.mode ??
            paymentOpsJson.stripeMode ??
            paymentConfigJson.mode,
        ),
      },
    };
  }

  private toUiStatus(status: OrderStatus) {
    if (status === OrderStatus.delivered) return 'completed';
    return status;
  }

  private normalizeMode(value: unknown): 'test' | 'live' {
    return String(value ?? '').trim().toLowerCase() === 'live'
      ? 'live'
      : 'test';
  }

  private asRecord(value: Prisma.JsonValue | null | undefined) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {} as Record<string, unknown>;
    }
    return value as Record<string, unknown>;
  }

  private asString(value: unknown, fallback: string) {
    if (typeof value !== 'string') return fallback;
    const next = value.trim();
    return next || fallback;
  }

  private asBoolean(value: unknown, fallback: boolean) {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return fallback;
  }
}

