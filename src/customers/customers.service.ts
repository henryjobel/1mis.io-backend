import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(storeId: string) {
    const grouped = await this.prisma.order.groupBy({
      by: ['customerEmail', 'customerName'],
      where: { storeId },
      _count: { _all: true },
      _sum: { total: true },
      orderBy: { _count: { customerEmail: 'desc' } },
    });

    return grouped.map((row) => ({
      customerEmail: row.customerEmail,
      customerName: row.customerName,
      orders: row._count._all,
      totalSpent: row._sum.total,
    }));
  }

  orders(storeId: string, email: string) {
    return this.prisma.order.findMany({
      where: { storeId, customerEmail: email },
      include: { items: true, shipment: true, paymentTxns: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
