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
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    config(storeId: string): Promise<string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray>;
    upsertConfig(storeId: string, dto: PaymentConfigDto, user: RequestUser): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
    }>;
    intent(storeId: string, dto: PaymentIntentDto, user: RequestUser): Promise<{
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string | null;
        provider: string;
        providerRef: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    confirm(storeId: string, dto: ConfirmPaymentDto, user: RequestUser): Promise<{
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string | null;
        provider: string;
        providerRef: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    refund(storeId: string, dto: RefundPaymentDto, user: RequestUser): Promise<{
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string | null;
        provider: string;
        providerRef: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    transactions(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string | null;
        provider: string;
        providerRef: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
}
export {};
