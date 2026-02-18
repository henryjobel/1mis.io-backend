import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<({
        items: {
            id: string;
            createdAt: Date;
            productId: string | null;
            orderId: string;
            productNameSnapshot: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        code: string;
        total: import("@prisma/client/runtime/library").Decimal;
        customerName: string;
        customerEmail: string;
    })[]>;
    updateStatus(storeId: string, orderId: string, status: OrderStatus): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string | null;
            orderId: string;
            productNameSnapshot: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        updatedAt: Date;
        code: string;
        total: import("@prisma/client/runtime/library").Decimal;
        customerName: string;
        customerEmail: string;
    }>;
}
