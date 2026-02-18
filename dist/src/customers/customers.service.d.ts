import { PrismaService } from '../prisma/prisma.service';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(storeId: string): Promise<{
        customerEmail: string;
        customerName: string;
        orders: number;
        totalSpent: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    orders(storeId: string, email: string): import(".prisma/client").Prisma.PrismaPromise<({
        items: {
            id: string;
            createdAt: Date;
            orderId: string;
            productId: string | null;
            productNameSnapshot: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
        paymentTxns: {
            id: string;
            storeId: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string | null;
            provider: string;
            providerRef: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        shipment: {
            id: string;
            storeId: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            orderId: string;
            courier: string;
            trackingNumber: string;
            trackingUrl: string | null;
            estimatedDelivery: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        } | null;
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
}
