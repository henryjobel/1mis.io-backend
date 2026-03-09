import { RequestUser } from '../common/interfaces/request-user.interface';
import { PaymentsService } from './payments.service';
declare class PaymentIntentDto {
    amount: number;
    orderId?: string;
    provider?: string;
    currency?: string;
}
declare class ConfirmPaymentDto {
    transactionId: string;
    providerRef: string;
    status?: string;
}
declare class RefundPaymentDto {
    transactionId: string;
    amount?: number;
}
declare class PaymentConfigDto {
    provider?: string;
    mode?: string;
    key?: string;
}
declare class PaymentTransactionListQueryDto {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    sort?: string;
}
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    config(storeId: string): Promise<string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray>;
    upsertConfig(storeId: string, dto: PaymentConfigDto, user: RequestUser): Promise<{
        key: string;
        updatedAt: Date;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
    }>;
    intent(storeId: string, dto: PaymentIntentDto, user: RequestUser): Promise<{
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
    }>;
    confirm(storeId: string, dto: ConfirmPaymentDto, user: RequestUser): Promise<{
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
    }>;
    refund(storeId: string, dto: RefundPaymentDto, user: RequestUser): Promise<{
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
    }>;
    transactions(storeId: string, query: PaymentTransactionListQueryDto): Promise<{
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            amount: import("@prisma/client/runtime/library").Decimal;
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
                unitPrice: import("@prisma/client/runtime/library").Decimal;
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
        }) | null;
    } & {
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
    }>;
}
export {};
