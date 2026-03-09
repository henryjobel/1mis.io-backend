import { RequestUser } from '../common/interfaces/request-user.interface';
import { OrdersService } from './orders.service';
declare class UpdateOrderStatusDto {
    status: string;
}
declare class OrdersListQueryDto {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    sort?: string;
}
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    list(storeId: string, query: OrdersListQueryDto): Promise<{
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
                unitPrice: import("@prisma/client/runtime/library").Decimal;
            }[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
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
    }>;
    updateStatus(storeId: string, orderId: string, dto: UpdateOrderStatusDto, user: RequestUser): Promise<{
        rawStatus: import(".prisma/client").$Enums.OrderStatus;
        status: string;
        items: {
            id: string;
            createdAt: Date;
            productId: string | null;
            orderId: string;
            productNameSnapshot: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
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
    }>;
}
export {};
