import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

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

    const orders = await this.prisma.order.findMany({
      where,
      select: {
        customerEmail: true,
        customerName: true,
        total: true,
        createdAt: true,
      },
    });

    const grouped = new Map<
      string,
      {
        customerEmail: string;
        customerName: string;
        orders: number;
        totalSpent: number;
        lastOrderAt: string;
      }
    >();

    for (const row of orders) {
      const key = row.customerEmail.trim().toLowerCase();
      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, {
          customerEmail: row.customerEmail,
          customerName: row.customerName,
          orders: 1,
          totalSpent: Number(row.total),
          lastOrderAt: row.createdAt.toISOString(),
        });
        continue;
      }

      existing.orders += 1;
      existing.totalSpent += Number(row.total);
      if (row.createdAt.toISOString() > existing.lastOrderAt) {
        existing.lastOrderAt = row.createdAt.toISOString();
      }
    }

    const itemsRaw = Array.from(grouped.values());
    const itemsSorted = itemsRaw.sort((a, b) =>
      this.compareCustomers(a, b, options?.sort),
    );
    const total = itemsSorted.length;
    const skip = (page - 1) * limit;
    const items = itemsSorted.slice(skip, skip + limit);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  orders(storeId: string, email: string) {
    return this.prisma.order.findMany({
      where: { storeId, customerEmail: email },
      include: { items: true, shipment: true, paymentTxns: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private parseOrderStatus(value?: string): OrderStatus | undefined {
    if (!value) return undefined;
    const raw = String(value).trim().toLowerCase();
    if (raw === 'completed') return OrderStatus.delivered;
    return Object.values(OrderStatus).find((status) => status === raw);
  }

  private compareCustomers(
    a: {
      customerName: string;
      customerEmail: string;
      orders: number;
      totalSpent: number;
      lastOrderAt: string;
    },
    b: {
      customerName: string;
      customerEmail: string;
      orders: number;
      totalSpent: number;
      lastOrderAt: string;
    },
    sort?: string,
  ) {
    const key = String(sort ?? 'lastOrder_desc').trim().toLowerCase();
    if (key === 'customer_asc') {
      return a.customerName.localeCompare(b.customerName);
    }
    if (key === 'customer_desc') {
      return b.customerName.localeCompare(a.customerName);
    }
    if (key === 'orders_asc') {
      return a.orders - b.orders;
    }
    if (key === 'orders_desc') {
      return b.orders - a.orders;
    }
    if (key === 'totalspent_asc') {
      return a.totalSpent - b.totalSpent;
    }
    if (key === 'totalspent_desc') {
      return b.totalSpent - a.totalSpent;
    }
    if (key === 'lastorder_asc') {
      return a.lastOrderAt.localeCompare(b.lastOrderAt);
    }
    return b.lastOrderAt.localeCompare(a.lastOrderAt);
  }
}
