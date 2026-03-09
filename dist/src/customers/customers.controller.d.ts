import { CustomersService } from './customers.service';
declare class CustomerListQueryDto {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    sort?: string;
}
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    list(storeId: string, query: CustomerListQueryDto): Promise<{
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
    orders(storeId: string, email: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
}
export {};
