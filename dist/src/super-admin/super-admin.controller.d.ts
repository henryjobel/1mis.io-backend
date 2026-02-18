import { Role, StoreStatus } from '@prisma/client';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { SuperAdminService } from './super-admin.service';
declare class UpdateStoreStatusDto {
    status: StoreStatus;
}
declare class UpdateLifecycleDto {
    publishStatus?: string;
    domainStatus?: string;
    sslStatus?: string;
    notes?: string;
}
declare class InviteAdminDto {
    name: string;
    email: string;
    role: Role;
}
declare class UpdatePaymentOpsDto {
    stripeEnabled?: boolean;
    sslCommerzEnabled?: boolean;
    codEnabled?: boolean;
    mode?: 'test' | 'live';
}
declare class UpdateTicketDto {
    status: 'open' | 'in_progress' | 'resolved';
    note?: string;
    priority?: 'low' | 'medium' | 'high';
}
declare class UpdateFlagDto {
    enabled: boolean;
    description?: string;
    rolloutPct?: number;
}
declare class UpdateSettingDto {
    valueJson: Record<string, unknown>;
}
declare class UpsertSettingsBatchDto {
    values: Record<string, Record<string, unknown>>;
}
declare class SubscriptionUpdateDto {
    plan?: string;
    status?: 'active' | 'trial' | 'past_due' | 'cancelled';
    nextBillingDate?: string;
    expiryDate?: string;
}
declare class UpdateAdminStatusDto {
    isActive: boolean;
}
declare class OverviewMetricsQueryDto {
    from?: string;
    to?: string;
}
export declare class SuperAdminController {
    private readonly superAdminService;
    constructor(superAdminService: SuperAdminService);
    overview(): Promise<{
        stores: number;
        users: number;
        orders: number;
        aiJobs: number;
    }>;
    overviewMetrics(query: OverviewMetricsQueryDto): Promise<{
        from: string | null;
        to: string | null;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
        totalOrders: number;
        activeStores: number;
        failedPayments: number;
    }>;
    stores(): import(".prisma/client").Prisma.PrismaPromise<{
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
    updateStoreStatus(id: string, dto: UpdateStoreStatusDto, user: RequestUser): Promise<{
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
    lifecycle(): import(".prisma/client").Prisma.GetStoreGroupByPayload<{
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
        lifecycleConfig: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | null;
    }>;
    updateLifecycle(storeId: string, dto: UpdateLifecycleDto, user: RequestUser): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
    }>;
    admins(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
    }[]>;
    inviteAdmin(dto: InviteAdminDto, user: RequestUser): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    updateAdminStatus(id: string, dto: UpdateAdminStatusDto, user: RequestUser): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
    }>;
    resetAdminPassword(id: string, user: RequestUser): Promise<{
        id: string;
        resetToken: string;
        simulated: boolean;
    }>;
    resendAdminInvite(id: string, user: RequestUser): Promise<{
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
    updateSubscription(storeId: string, dto: SubscriptionUpdateDto, user: RequestUser): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
    }>;
    retrySubscription(storeId: string, user: RequestUser): Promise<{
        retried: boolean;
        storeId: string;
        result: {
            updatedAt: Date;
            key: string;
            valueJson: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    cancelSubscription(storeId: string, user: RequestUser): Promise<{
        cancelled: boolean;
        storeId: string;
        result: {
            updatedAt: Date;
            key: string;
            valueJson: import("@prisma/client/runtime/library").JsonValue;
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
        config: string | number | boolean | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | null;
        message: string;
    }>;
    updatePaymentOps(storeId: string, dto: UpdatePaymentOpsDto, user: RequestUser): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
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
    updateTicket(id: string, dto: UpdateTicketDto, user: RequestUser): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
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
        grouped: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.AiGenerationJobGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
    }>;
    flags(): import(".prisma/client").Prisma.PrismaPromise<{
        updatedAt: Date;
        key: string;
        description: string | null;
        enabled: boolean;
        rolloutPct: number;
    }[]>;
    upsertFlag(key: string, dto: UpdateFlagDto, user: RequestUser): Promise<{
        updatedAt: Date;
        key: string;
        description: string | null;
        enabled: boolean;
        rolloutPct: number;
    }>;
    auditLogs(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        role: import(".prisma/client").$Enums.Role | null;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        metaJson: import("@prisma/client/runtime/library").JsonValue | null;
        actorUserId: string | null;
    }[]>;
    settings(): import(".prisma/client").Prisma.PrismaPromise<{
        updatedAt: Date;
        key: string;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    upsertSetting(key: string, dto: UpdateSettingDto, user: RequestUser): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
    }>;
    upsertSettingsBatch(dto: UpsertSettingsBatchDto, user: RequestUser): Promise<{
        updated: number;
    }>;
}
export {};
