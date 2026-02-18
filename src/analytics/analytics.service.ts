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
}
