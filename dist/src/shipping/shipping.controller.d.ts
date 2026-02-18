import { RequestUser } from '../common/interfaces/request-user.interface';
import { ShippingService } from './shipping.service';
declare class ShippingRateDto {
    name: string;
    country: string;
    amount: number;
}
declare class ShippingConfigDto {
    rates: ShippingRateDto[];
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
export declare class ShippingController {
    private readonly shippingService;
    constructor(shippingService: ShippingService);
    config(storeId: string): Promise<string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray>;
    upsertConfig(storeId: string, dto: ShippingConfigDto, user: RequestUser): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
    }>;
    shipOrder(storeId: string, dto: ShipOrderDto, user: RequestUser): Promise<{
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
    }>;
    updateTracking(storeId: string, shipmentId: string, dto: TrackingStatusDto, user: RequestUser): Promise<{
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
    }>;
    shipments(storeId: string): import(".prisma/client").Prisma.PrismaPromise<({
        order: {
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
        };
    } & {
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
    })[]>;
}
export {};
