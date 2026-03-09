import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ShippingService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    getConfig(storeId: string): Promise<{
        methods: {
            standard: boolean;
            express: boolean;
            pickup: boolean;
            cod: boolean;
        };
        charges: {
            flatCharge: number;
            expressCharge: number;
        };
        rates: {
            name: string;
            country: string;
            amount: number;
        }[];
    }>;
    upsertConfig(storeId: string, data: {
        methods?: {
            standard?: boolean;
            express?: boolean;
            pickup?: boolean;
            cod?: boolean;
        };
        charges?: {
            flatCharge?: number;
            expressCharge?: number;
        };
        rates?: Array<{
            name: string;
            country: string;
            amount: number;
        }>;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        methods: {
            standard: boolean;
            express: boolean;
            pickup: boolean;
            cod: boolean;
        };
        charges: {
            flatCharge: number;
            expressCharge: number;
        };
        rates: {
            name: string;
            country: string;
            amount: number;
        }[];
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
    shipments(storeId: string, options?: {
        page?: number;
        limit?: number;
        q?: string;
        status?: string;
        sort?: string;
        from?: string;
        to?: string;
    }): Promise<{
        items: ({
            order: {
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
        })[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    orders(storeId: string, options?: {
        page?: number;
        limit?: number;
        q?: string;
        status?: string;
        sort?: string;
        from?: string;
        to?: string;
    }): Promise<{
        items: {
            id: string;
            code: string;
            status: string;
            rawStatus: import(".prisma/client").$Enums.OrderStatus;
            customerName: string;
            customerEmail: string;
            total: Prisma.Decimal;
            createdAt: Date;
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
            delivery: {
                eligible: boolean;
                blockedProductIds: string[];
            };
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    shipment(storeId: string, shipmentId: string): Promise<{
        order: {
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
    }>;
    private normalizeConfig;
    private shipmentSort;
    private orderSort;
    private parseOrderStatus;
    private toUiStatus;
    private asRecord;
    private asString;
    private asNumber;
    private asBoolean;
}
