import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(storeId: string, options?: {
        page?: number;
        limit?: number;
        q?: string;
        status?: string;
        from?: string;
        to?: string;
        sort?: string;
    }): Promise<{
        items: {
            customerEmail: string;
            customerName: string;
            orders: number;
            totalSpent: number;
            lastOrderAt: string;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    orders(storeId: string, email: string): Prisma.PrismaPromise<({
        shipment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            orderId: string;
            courier: string;
            trackingNumber: string;
            trackingUrl: string | null;
            estimatedDelivery: Date | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        } | null;
        items: {
            id: string;
            createdAt: Date;
            productId: string | null;
            orderId: string;
            productNameSnapshot: string;
            qty: number;
            unitPrice: Prisma.Decimal;
        }[];
        paymentTxns: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            provider: string;
            providerRef: string | null;
            metadata: Prisma.JsonValue | null;
            amount: Prisma.Decimal;
            currency: string;
            orderId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        code: string;
        total: Prisma.Decimal;
        customerEmail: string;
        customerName: string;
        customerPhone: string | null;
        shippingAddress: Prisma.JsonValue | null;
        subtotal: Prisma.Decimal | null;
        discountTotal: Prisma.Decimal | null;
        taxTotal: Prisma.Decimal | null;
        shippingTotal: Prisma.Decimal | null;
        couponCode: string | null;
    })[]>;
    private parseOrderStatus;
    private compareCustomers;
}
