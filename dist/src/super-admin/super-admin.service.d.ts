import { Prisma, Role, StoreStatus } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class SuperAdminService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    overview(): Promise<{
        stores: number;
        users: number;
        orders: number;
        aiJobs: number;
    }>;
    overviewMetrics(from?: string, to?: string): Promise<{
        from: string | null;
        to: string | null;
        totalRevenue: number | Prisma.Decimal;
        totalOrders: number;
        activeStores: number;
        failedPayments: number;
    }>;
    stores(): Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        slug: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        themePreset: string | null;
        publishedAt: Date | null;
    }[]>;
    updateStoreStatus(id: string, status: StoreStatus, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        slug: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        themePreset: string | null;
        publishedAt: Date | null;
    }>;
    lifecycle(): Prisma.GetStoreGroupByPayload<{
        by: "status"[];
        _count: true;
    }>;
    lifecycleByStore(storeId: string): Promise<{
        store: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            slug: string;
            status: import(".prisma/client").$Enums.StoreStatus;
            themePreset: string | null;
            publishedAt: Date | null;
        } | null;
        lifecycleConfig: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
    }>;
    updateLifecycle(storeId: string, payload: {
        publishStatus?: string;
        domainStatus?: string;
        sslStatus?: string;
        notes?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: Prisma.JsonValue;
    }>;
    admins(): Prisma.PrismaPromise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
    }[]>;
    inviteAdmin(data: {
        name: string;
        email: string;
        role: Role;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    updateAdminStatus(id: string, isActive: boolean, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
    }>;
    resetAdminPassword(id: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        resetToken: string;
        simulated: boolean;
    }>;
    resendAdminInvite(id: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        resent: boolean;
        simulated: boolean;
    }>;
    subscriptions(): Promise<{
        storeId: string;
        storeName: string;
        subscription: Record<string, unknown>;
        createdAt: Date;
    }[]>;
    subscriptionByStore(storeId: string): Promise<{
        storeId: string;
        storeName: string;
        subscription: Record<string, unknown>;
    }>;
    updateSubscription(storeId: string, payload: {
        plan?: string;
        status?: 'active' | 'trial' | 'past_due' | 'cancelled';
        nextBillingDate?: string;
        expiryDate?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: Prisma.JsonValue;
    }>;
    retrySubscription(storeId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        retried: boolean;
        storeId: string;
        result: {
            updatedAt: Date;
            key: string;
            valueJson: Prisma.JsonValue;
        };
    }>;
    cancelSubscription(storeId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        cancelled: boolean;
        storeId: string;
        result: {
            updatedAt: Date;
            key: string;
            valueJson: Prisma.JsonValue;
        };
    }>;
    paymentOps(): Promise<{
        storeId: string;
    }[]>;
    paymentOpsMetrics(): Promise<{
        totalTransactions: number;
        failedTransactions: number;
        successRatePct: number;
    }>;
    paymentOpsByStore(storeId: string): Promise<{
        storeId: string;
        config: string | number | boolean | Prisma.JsonObject | Prisma.JsonArray | null;
        message: string;
    }>;
    updatePaymentOps(storeId: string, payload: {
        stripeEnabled?: boolean;
        sslCommerzEnabled?: boolean;
        codEnabled?: boolean;
        mode?: 'test' | 'live';
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: Prisma.JsonValue;
    }>;
    tickets(): Promise<{
        items: {
            id: string;
        }[];
        note: string;
    }>;
    ticket(id: string): Promise<{
        note: string;
        id: string;
    }>;
    updateTicket(id: string, payload: {
        status: 'open' | 'in_progress' | 'resolved';
        note?: string;
        priority?: 'low' | 'medium' | 'high';
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: Prisma.JsonValue;
    }>;
    health(): {
        status: string;
        services: string[];
    };
    restartService(service: string): {
        service: string;
        restarted: boolean;
        mode: string;
    };
    aiUsage(): Promise<{
        grouped: (Prisma.PickEnumerable<Prisma.AiGenerationJobGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
    }>;
    flags(): Prisma.PrismaPromise<{
        updatedAt: Date;
        key: string;
        description: string | null;
        enabled: boolean;
        rolloutPct: number;
    }[]>;
    upsertFlag(key: string, enabled: boolean, description: string | undefined, rolloutPct: number | undefined, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updatedAt: Date;
        key: string;
        description: string | null;
        enabled: boolean;
        rolloutPct: number;
    }>;
    auditLogs(): Prisma.PrismaPromise<{
        id: string;
        role: import(".prisma/client").$Enums.Role | null;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        metaJson: Prisma.JsonValue | null;
        actorUserId: string | null;
    }[]>;
    settings(): Prisma.PrismaPromise<{
        updatedAt: Date;
        key: string;
        valueJson: Prisma.JsonValue;
    }[]>;
    upsertSetting(key: string, valueJson: Record<string, unknown>, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: Prisma.JsonValue;
    }>;
    upsertSettingsBatch(values: Record<string, Record<string, unknown>>, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updated: number;
    }>;
}
