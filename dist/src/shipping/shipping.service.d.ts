import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ShippingService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    getConfig(storeId: string): Promise<string | number | boolean | Prisma.JsonObject | Prisma.JsonArray>;
    upsertConfig(storeId: string, data: {
        rates: Array<{
            name: string;
            country: string;
            amount: number;
        }>;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: Prisma.JsonValue;
    }>;
    shipOrder(storeId: string, data: {
        orderId: string;
        courier: string;
        trackingNumber: string;
        trackingUrl?: string;
        estimatedDelivery?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    }>;
    updateTracking(storeId: string, shipmentId: string, status: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    }>;
    shipments(storeId: string): Prisma.PrismaPromise<({
        order: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            code: string;
            total: Prisma.Decimal;
            customerName: string;
            customerEmail: string;
            customerPhone: string | null;
            shippingAddress: Prisma.JsonValue | null;
            subtotal: Prisma.Decimal | null;
            discountTotal: Prisma.Decimal | null;
            taxTotal: Prisma.Decimal | null;
            shippingTotal: Prisma.Decimal | null;
            couponCode: string | null;
        };
    } & {
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
    })[]>;
}
