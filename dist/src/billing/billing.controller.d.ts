import { Response } from 'express';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { BillingService } from './billing.service';
declare class RenewSubscriptionDto {
    planKey?: string;
    months?: number;
}
declare class InitSslCommerzDto {
    planKey?: string;
}
declare class CancelSubscriptionDto {
    reason?: string;
}
declare class SubscriptionListQueryDto {
    page?: number;
    limit?: number;
}
declare class SslCommerzSubscriptionWebhookDto {
    invoiceId?: string;
    transactionId?: string;
    eventType?: string;
    status?: string;
    storeId?: string;
    amountBdt?: number;
    payload?: Record<string, unknown>;
}
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    plans(): Promise<{
        id: string;
        key: string;
        name: string;
        priceBdt: number;
        billingCycleDays: number;
        productLimit: number | null;
        aiLimit: number | null;
        storageLimitMb: number | null;
        customDomainAllowed: boolean;
        advancedAiEnabled: boolean;
        analyticsEnabled: boolean;
        prioritySupport: boolean;
        isActive: boolean;
    }[]>;
    storeSubscription(storeId: string): Promise<{
        storeId: string;
        subscription: {
            id: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            startDate: string;
            endDate: string;
            cancelledAt: string | null;
            isExpired: boolean;
            daysRemaining: number;
        };
        plan: {
            id: string;
            key: string;
            name: string;
            priceBdt: number;
            billingCycleDays: number;
            productLimit: number | null;
            aiLimit: number | null;
            storageLimitMb: number | null;
            customDomainAllowed: boolean;
            advancedAiEnabled: boolean;
            analyticsEnabled: boolean;
            prioritySupport: boolean;
            isActive: boolean;
        };
        usage: {
            aiRequestsUsed: number;
            productsUsed: number;
            storageUsedMb: number;
            periodStart: string;
            periodEnd: string;
        };
        limits: {
            productLimit: number | null;
            aiLimit: number | null;
            storageLimitMb: number | null;
            customDomainAllowed: boolean;
        };
        features: {
            advancedAiEnabled: boolean;
            analyticsEnabled: boolean;
            prioritySupport: boolean;
        };
    }>;
    storeSubscriptionInvoices(storeId: string, query: SubscriptionListQueryDto): Promise<{
        items: {
            id: string;
            subscriptionId: string | null;
            plan: {
                id: string;
                key: string;
                name: string;
                priceBdt: number;
            };
            amountBdt: number;
            status: import(".prisma/client").$Enums.SubscriptionInvoiceStatus;
            provider: string;
            providerRef: string | null;
            dueDate: string | null;
            paidAt: string | null;
            createdAt: string;
            updatedAt: string;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    storeSubscriptionEvents(storeId: string, query: SubscriptionListQueryDto): Promise<{
        items: {
            id: string;
            invoiceId: string | null;
            provider: string;
            eventType: string | null;
            status: string | null;
            providerRef: string | null;
            createdAt: string;
            invoice: {
                id: string;
                status: import(".prisma/client").$Enums.SubscriptionInvoiceStatus;
                provider: string;
                providerRef: string | null;
            } | null;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    renew(storeId: string, dto: RenewSubscriptionDto, user: RequestUser): Promise<{
        invoice: {
            id: string;
            status: import(".prisma/client").$Enums.SubscriptionInvoiceStatus;
            amountBdt: number;
            provider: string;
            paidAt: string | null;
        };
        renewed: boolean;
        storeId: string;
        subscription: {
            id: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            startDate: string;
            endDate: string;
            cancelledAt: string | null;
            isExpired: boolean;
            daysRemaining: number;
        };
        plan: {
            id: string;
            key: string;
            name: string;
            priceBdt: number;
            billingCycleDays: number;
            productLimit: number | null;
            aiLimit: number | null;
            storageLimitMb: number | null;
            customDomainAllowed: boolean;
            advancedAiEnabled: boolean;
            analyticsEnabled: boolean;
            prioritySupport: boolean;
            isActive: boolean;
        };
        usage: {
            aiRequestsUsed: number;
            productsUsed: number;
            storageUsedMb: number;
            periodStart: string;
            periodEnd: string;
        };
        limits: {
            productLimit: number | null;
            aiLimit: number | null;
            storageLimitMb: number | null;
            customDomainAllowed: boolean;
        };
        features: {
            advancedAiEnabled: boolean;
            analyticsEnabled: boolean;
            prioritySupport: boolean;
        };
    }>;
    initSslCommerz(storeId: string, dto: InitSslCommerzDto, user: RequestUser): Promise<{
        invoiceId: string;
        storeId: string;
        planKey: string;
        amountBdt: number;
        currency: string;
        status: import(".prisma/client").$Enums.SubscriptionInvoiceStatus;
        provider: string;
        mode: "mock" | "live";
        transactionId: string;
        paymentUrl: string;
        expiresAt: string;
    }>;
    cancelSubscription(storeId: string, dto: CancelSubscriptionDto, user: RequestUser): Promise<{
        cancelled: boolean;
        cancelledAt: string | null;
        reason: string | null;
        storeId: string;
        subscription: {
            id: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            startDate: string;
            endDate: string;
            cancelledAt: string | null;
            isExpired: boolean;
            daysRemaining: number;
        };
        plan: {
            id: string;
            key: string;
            name: string;
            priceBdt: number;
            billingCycleDays: number;
            productLimit: number | null;
            aiLimit: number | null;
            storageLimitMb: number | null;
            customDomainAllowed: boolean;
            advancedAiEnabled: boolean;
            analyticsEnabled: boolean;
            prioritySupport: boolean;
            isActive: boolean;
        };
        usage: {
            aiRequestsUsed: number;
            productsUsed: number;
            storageUsedMb: number;
            periodStart: string;
            periodEnd: string;
        };
        limits: {
            productLimit: number | null;
            aiLimit: number | null;
            storageLimitMb: number | null;
            customDomainAllowed: boolean;
        };
        features: {
            advancedAiEnabled: boolean;
            analyticsEnabled: boolean;
            prioritySupport: boolean;
        };
    }>;
    sslCommerzSubscriptionWebhook(dto: SslCommerzSubscriptionWebhookDto, secret?: string, webhookToken?: string): Promise<{
        accepted: boolean;
        processed: boolean;
        reason: string;
        invoiceId?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode: "mock" | "skipped" | "api";
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        alreadyPaid: boolean;
        invoiceId: string;
        subscriptionId: string | null;
        reason?: undefined;
        validationMode?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        subscriptionId: string;
        newEndDate: string;
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        status: "failed" | "cancelled" | "pending";
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
    }>;
    sslCommerzSubscriptionIpn(payload: Record<string, unknown>, secret?: string, webhookToken?: string): Promise<{
        accepted: boolean;
        processed: boolean;
        reason: string;
        invoiceId?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode: "mock" | "skipped" | "api";
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        alreadyPaid: boolean;
        invoiceId: string;
        subscriptionId: string | null;
        reason?: undefined;
        validationMode?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        subscriptionId: string;
        newEndDate: string;
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        status: "failed" | "cancelled" | "pending";
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
    }>;
    sslCommerzSubscriptionSuccessPost(payload: Record<string, unknown>, secret?: string, webhookToken?: string): Promise<{
        accepted: boolean;
        processed: boolean;
        reason: string;
        invoiceId?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode: "mock" | "skipped" | "api";
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        alreadyPaid: boolean;
        invoiceId: string;
        subscriptionId: string | null;
        reason?: undefined;
        validationMode?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        subscriptionId: string;
        newEndDate: string;
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        status: "failed" | "cancelled" | "pending";
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
    }>;
    sslCommerzSubscriptionSuccessGet(payload: Record<string, unknown>, res: Response, secret?: string, webhookToken?: string): Promise<void>;
    sslCommerzSubscriptionFailPost(payload: Record<string, unknown>, secret?: string, webhookToken?: string): Promise<{
        accepted: boolean;
        processed: boolean;
        reason: string;
        invoiceId?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode: "mock" | "skipped" | "api";
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        alreadyPaid: boolean;
        invoiceId: string;
        subscriptionId: string | null;
        reason?: undefined;
        validationMode?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        subscriptionId: string;
        newEndDate: string;
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        status: "failed" | "cancelled" | "pending";
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
    }>;
    sslCommerzSubscriptionFailGet(payload: Record<string, unknown>, res: Response, secret?: string, webhookToken?: string): Promise<void>;
    sslCommerzSubscriptionCancelPost(payload: Record<string, unknown>, secret?: string, webhookToken?: string): Promise<{
        accepted: boolean;
        processed: boolean;
        reason: string;
        invoiceId?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode: "mock" | "skipped" | "api";
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        alreadyPaid: boolean;
        invoiceId: string;
        subscriptionId: string | null;
        reason?: undefined;
        validationMode?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        subscriptionId: string;
        newEndDate: string;
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        status: "failed" | "cancelled" | "pending";
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
    }>;
    sslCommerzSubscriptionCancelGet(payload: Record<string, unknown>, res: Response, secret?: string, webhookToken?: string): Promise<void>;
    sslCommerzSubscriptionMock(invoiceId: string, status?: string): Promise<{
        accepted: boolean;
        processed: boolean;
        reason: string;
        invoiceId?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        reason: string;
        validationMode: "mock" | "skipped" | "api";
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        alreadyPaid: boolean;
        invoiceId: string;
        subscriptionId: string | null;
        reason?: undefined;
        validationMode?: undefined;
        newEndDate?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        subscriptionId: string;
        newEndDate: string;
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        status?: undefined;
    } | {
        accepted: boolean;
        processed: boolean;
        invoiceId: string;
        status: "failed" | "cancelled" | "pending";
        reason?: undefined;
        validationMode?: undefined;
        alreadyPaid?: undefined;
        subscriptionId?: undefined;
        newEndDate?: undefined;
    }>;
}
export {};
