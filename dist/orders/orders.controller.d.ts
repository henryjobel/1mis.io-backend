import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
declare class UpdateOrderStatusDto {
    status: OrderStatus;
}
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
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
    updateStatus(storeId: string, orderId: string, dto: UpdateOrderStatusDto): Promise<{
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
export {};
