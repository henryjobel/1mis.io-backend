import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
type WebhookPaymentStatus = 'paid' | 'failed' | 'cancelled' | 'pending';
export declare class BillingService {
    private readonly prisma;
    private readonly configService;
    private readonly auditService;
    constructor(prisma: PrismaService, configService: ConfigService, auditService: AuditService);
    listPlans(): Promise<{
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
    listSubscriptionInvoices(storeId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
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
    listSubscriptionPaymentEvents(storeId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
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
    assertProductCreateAllowed(storeId: string, createCount?: number, options?: {
        existingProductsCount?: number;
    }): Promise<{
        limit: number | null;
        existingProductsCount: number;
        nextProductsCount: number;
    }>;
    syncProductsUsage(storeId: string, productsUsed?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        aiRequestsUsed: number;
        productsUsed: number;
        storageUsedMb: number;
        periodStart: Date;
        periodEnd: Date;
    }>;
    consumeAiUsage(storeId: string, units?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        aiRequestsUsed: number;
        productsUsed: number;
        storageUsedMb: number;
        periodStart: Date;
        periodEnd: Date;
    }>;
    assertStorageUploadAllowed(storeId: string, sizeBytes: number): Promise<{
        limit: number | null;
        currentStorageUsedMb: number;
        requestedStorageMb: number;
        nextStorageUsedMb: number;
    }>;
    consumeStorageUsage(storeId: string, sizeBytes: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        aiRequestsUsed: number;
        productsUsed: number;
        storageUsedMb: number;
        periodStart: Date;
        periodEnd: Date;
    }>;
    releaseStorageUsage(storeId: string, sizeBytes: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        aiRequestsUsed: number;
        productsUsed: number;
        storageUsedMb: number;
        periodStart: Date;
        periodEnd: Date;
    }>;
    assertPublishAllowed(storeId: string): Promise<{
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
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        userId: string;
        planId: string;
        startDate: Date;
        endDate: Date;
        cancelledAt: Date | null;
    }>;
    assertCustomDomainAllowed(storeId: string): Promise<{
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
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        userId: string;
        planId: string;
        startDate: Date;
        endDate: Date;
        cancelledAt: Date | null;
    }>;
    renewSubscription(storeId: string, actor: {
        id: string;
        role: Role;
    }, options?: {
        planKey?: string;
        months?: number;
    }): Promise<{
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
    initSslCommerz(storeId: string, actor: {
        id: string;
        role: Role;
    }, options?: {
        planKey?: string;
    }): Promise<{
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
    cancelSubscription(storeId: string, actor: {
        id: string;
        role: Role;
    }, reason?: string): Promise<{
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
    handleSslCommerzProviderCallback(payload: Record<string, unknown>, secret?: string, options?: {
        forcedStatus?: WebhookPaymentStatus;
        source?: string;
    }): Promise<{
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
    mockSslCommerzSubscriptionResult(invoiceId: string, status?: WebhookPaymentStatus): Promise<{
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
    buildOwnerBillingRedirectUrl(status: 'success' | 'failed' | 'cancelled', payload: Record<string, unknown>, callbackResult?: Record<string, unknown>): string;
    handleSslCommerzSubscriptionWebhook(data: {
        invoiceId?: string;
        transactionId?: string;
        eventType?: string;
        status?: string;
        storeId?: string;
        amountBdt?: number;
        payload?: Record<string, unknown>;
    }, secret?: string): Promise<{
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
    private ensureStoreSubscription;
    private ensureUsageTracking;
    private buildSubscriptionPayload;
    private mapPlan;
    private resolveStore;
    private ensureFreePlan;
    private getActivePlanByKey;
    private currentUsagePeriod;
    private addDays;
    private bytesToMegabytes;
    private initSslCommerzSession;
    private validateSslCommerzPaidEvent;
    private buildSslCommerzCallbackUrls;
    private resolveOwnerBillingRedirectBaseUrl;
    private trimTrailingSlash;
    private pickString;
    private pickNumber;
    private pickBoolean;
    private withWebhookToken;
    private normalizePaymentStatus;
    private toInvoiceStatus;
    private findInvoiceForWebhook;
    private createOrphanWebhookEvent;
    private asRecord;
}
export {};
