import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    getConfig(storeId: string): Promise<string | number | boolean | Prisma.JsonObject | Prisma.JsonArray>;
    upsertConfig(storeId: string, data: Record<string, unknown>, actor: {
        id: string;
        role: Role;
    }): Promise<{
        key: string;
        updatedAt: Date;
        valueJson: Prisma.JsonValue;
    }>;
    createIntent(storeId: string, data: {
        amount: number;
        orderId?: string;
        provider?: string;
        currency?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    }>;
    confirm(storeId: string, data: {
        transactionId: string;
        providerRef: string;
        status?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    }>;
    refund(storeId: string, data: {
        transactionId: string;
        amount?: number;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    }>;
    transactions(storeId: string, options?: {
        page?: number;
        limit?: number;
        q?: string;
        status?: string;
        from?: string;
        to?: string;
        sort?: string;
    }): Promise<{
        items: ({
            order: {
                id: string;
                code: string;
                customerEmail: string;
                customerName: string;
            } | null;
        } & {
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
        })[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    transaction(storeId: string, transactionId: string): Promise<{
        order: ({
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
        }) | null;
    } & {
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
    }>;
    private transactionSort;
}
