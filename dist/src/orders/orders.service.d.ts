import { OrderStatus, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class OrdersService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
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
    updateStatus(storeId: string, orderId: string, status: OrderStatus, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
