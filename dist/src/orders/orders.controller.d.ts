import { OrderStatus } from '@prisma/client';
import { RequestUser } from '../common/interfaces/request-user.interface';
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
            orderId: string;
            productId: string | null;
            productNameSnapshot: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        storeId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        code: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        subtotal: import("@prisma/client/runtime/library").Decimal | null;
        discountTotal: import("@prisma/client/runtime/library").Decimal | null;
        taxTotal: import("@prisma/client/runtime/library").Decimal | null;
        shippingTotal: import("@prisma/client/runtime/library").Decimal | null;
        couponCode: string | null;
    })[]>;
    updateStatus(storeId: string, orderId: string, dto: UpdateOrderStatusDto, user: RequestUser): Promise<{
        items: {
            id: string;
            createdAt: Date;
            orderId: string;
            productId: string | null;
            productNameSnapshot: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        storeId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        code: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        subtotal: import("@prisma/client/runtime/library").Decimal | null;
        discountTotal: import("@prisma/client/runtime/library").Decimal | null;
        taxTotal: import("@prisma/client/runtime/library").Decimal | null;
        shippingTotal: import("@prisma/client/runtime/library").Decimal | null;
        couponCode: string | null;
    }>;
}
export {};
