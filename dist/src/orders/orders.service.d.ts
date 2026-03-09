import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class OrdersService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
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
            rawStatus: import(".prisma/client").$Enums.OrderStatus;
            status: string;
            items: {
                id: string;
                createdAt: Date;
                productId: string | null;
                orderId: string;
                productNameSnapshot: string;
                qty: number;
                unitPrice: Prisma.Decimal;
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
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
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    findOne(storeId: string, orderId: string): Promise<{
        rawStatus: import(".prisma/client").$Enums.OrderStatus;
        status: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
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
    }>;
    updateStatus(storeId: string, orderId: string, status: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        rawStatus: import(".prisma/client").$Enums.OrderStatus;
        status: string;
        items: {
            id: string;
            createdAt: Date;
            productId: string | null;
            orderId: string;
            productNameSnapshot: string;
            qty: number;
            unitPrice: Prisma.Decimal;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
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
    }>;
    private parseOrderStatus;
    private toUiStatus;
    private orderSort;
}
