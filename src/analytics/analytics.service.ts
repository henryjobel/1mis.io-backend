import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(storeId: string, from?: string, to?: string) {
    const where = {
      storeId,
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    };

    const [ordersCount, totalRevenue, aov, statusBreakdown] = await Promise.all(
      [
        this.prisma.order.count({ where }),
        this.prisma.order.aggregate({ where, _sum: { total: true } }),
        this.prisma.order.aggregate({ where, _avg: { total: true } }),
        this.prisma.order.groupBy({ by: ['status'], where, _count: true }),
      ],
    );

    return {
      ordersCount,
      totalRevenue: totalRevenue._sum.total ?? 0,
      averageOrderValue: aov._avg.total ?? 0,
      statusBreakdown,
    };
  }

  async topProducts(storeId: string) {
    const rows = await this.prisma.orderItem.groupBy({
      by: ['productId', 'productNameSnapshot'],
      where: { order: { storeId } },
      _sum: { qty: true, unitPrice: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 10,
    });

    return rows.map((row) => ({
      productId: row.productId,
      productName: row.productNameSnapshot,
      totalQty: row._sum.qty ?? 0,
      revenueApprox: row._sum.unitPrice ?? 0,
    }));
  }

  async dashboard(storeId: string, from?: string, to?: string) {
    const createdAt =
      from || to
        ? {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          }
        : undefined;
    const orderWhere = createdAt ? { storeId, createdAt } : { storeId };

    const [
      orderStats,
      totalOrders,
      completedOrders,
      customerCount,
      activeProducts,
      lowStockProducts,
      lowStockVariants,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: orderWhere,
        _sum: { total: true },
        _avg: { total: true },
      }),
      this.prisma.order.count({ where: orderWhere }),
      this.prisma.order.count({
        where: {
          ...orderWhere,
          status: { in: ['paid', 'processing', 'shipped', 'delivered'] },
        },
      }),
      this.prisma.order
        .groupBy({
          by: ['customerEmail'],
          where: orderWhere,
        })
        .then((rows) => rows.length),
      this.prisma.product.count({
        where: { storeId, status: 'active' },
      }),
      this.prisma.product.count({
        where: { storeId, status: 'active', stock: { lte: 5 } },
      }),
      this.prisma.productVariant.count({
        where: {
          stock: { lte: 5 },
          product: { storeId, status: 'active' },
        },
      }),
    ]);

    const conversionRate =
      totalOrders > 0 ? Number(((completedOrders / totalOrders) * 100).toFixed(2)) : 0;

    return {
      from: from ?? null,
      to: to ?? null,
      revenue: orderStats._sum.total ?? 0,
      orders: totalOrders,
      averageOrderValue: orderStats._avg.total ?? 0,
      customers: customerCount,
      products: activeProducts,
      lowStockAlerts: lowStockProducts + lowStockVariants,
      conversionRatePct: conversionRate,
    };
  }
}
