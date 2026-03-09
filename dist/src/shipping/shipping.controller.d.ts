import { RequestUser } from '../common/interfaces/request-user.interface';
import { ShippingService } from './shipping.service';
declare class ShippingRateDto {
    name: string;
    country: string;
    amount: number;
}
declare class ShippingMethodsDto {
    standard?: boolean;
    express?: boolean;
    pickup?: boolean;
    cod?: boolean;
}
declare class ShippingChargesDto {
    flatCharge?: number;
    expressCharge?: number;
}
declare class ShippingConfigDto {
    methods?: ShippingMethodsDto;
    charges?: ShippingChargesDto;
    rates?: ShippingRateDto[];
}
declare class ShipOrderDto {
    orderId: string;
    courier: string;
    trackingNumber: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
}
declare class TrackingStatusDto {
    status: string;
}
declare class ShippingListQueryDto {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    sort?: string;
    from?: string;
    to?: string;
}
export declare class ShippingController {
    private readonly shippingService;
    constructor(shippingService: ShippingService);
    config(storeId: string): Promise<{
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
    upsertConfig(storeId: string, dto: ShippingConfigDto, user: RequestUser): Promise<{
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
    shipOrder(storeId: string, dto: ShipOrderDto, user: RequestUser): Promise<{
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
    updateTracking(storeId: string, shipmentId: string, dto: TrackingStatusDto, user: RequestUser): Promise<{
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
    shipments(storeId: string, query: ShippingListQueryDto): Promise<{
        items: ({
            order: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                code: string;
                total: import("@prisma/client/runtime/library").Decimal;
                customerEmail: string;
                customerName: string;
                customerPhone: string | null;
                shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
                subtotal: import("@prisma/client/runtime/library").Decimal | null;
                discountTotal: import("@prisma/client/runtime/library").Decimal | null;
                taxTotal: import("@prisma/client/runtime/library").Decimal | null;
                shippingTotal: import("@prisma/client/runtime/library").Decimal | null;
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
    orders(storeId: string, query: ShippingListQueryDto): Promise<{
        items: {
            id: string;
            code: string;
            status: string;
            rawStatus: import(".prisma/client").$Enums.OrderStatus;
            customerName: string;
            customerEmail: string;
            total: import("@prisma/client/runtime/library").Decimal;
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
                unitPrice: import("@prisma/client/runtime/library").Decimal;
            }[];
            paymentTxns: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                status: string;
                provider: string;
                providerRef: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                amount: import("@prisma/client/runtime/library").Decimal;
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
            total: import("@prisma/client/runtime/library").Decimal;
            customerEmail: string;
            customerName: string;
            customerPhone: string | null;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
            subtotal: import("@prisma/client/runtime/library").Decimal | null;
            discountTotal: import("@prisma/client/runtime/library").Decimal | null;
            taxTotal: import("@prisma/client/runtime/library").Decimal | null;
            shippingTotal: import("@prisma/client/runtime/library").Decimal | null;
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
}
export {};
