import { Role, StoreStatus } from '@prisma/client';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { SuperAdminService } from './super-admin.service';
declare class UpdateStoreStatusDto {
    status: StoreStatus;
}
declare class CreateStoreDto {
    name: string;
    ownerEmail: string;
    plan?: 'Starter' | 'Growth' | 'Scale';
    region?: string;
    status?: 'active' | 'trial' | 'suspended';
}
declare class UpdateLifecycleDto {
    publishStatus?: string;
    domainStatus?: string;
    sslStatus?: string;
    notes?: string;
}
declare class ThemeSyncDto {
    at?: string;
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
declare class CreateIncidentDto {
    title: string;
    level: 'info' | 'warning' | 'critical';
    status?: 'monitoring' | 'resolved';
    startedAt?: string;
    note?: string;
}
declare class UpdateIncidentDto {
    title?: string;
    level?: 'info' | 'warning' | 'critical';
    status?: 'monitoring' | 'resolved';
    note?: string;
    resolutionNote?: string;
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
declare class SetMaintenanceModeDto {
    enabled: boolean;
}
declare class UpdateAiHardCapDto {
    hardCapUsd: number;
}
declare class OverviewMetricsQueryDto {
    from?: string;
    to?: string;
}
declare class AuditLogQueryDto {
    format?: 'dashboard';
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
    stores(): Promise<{
        id: string;
        name: string;
        ownerEmail: string;
        plan: "Starter" | "Growth" | "Scale";
        region: string;
        gmvUsd: number;
        status: "active" | "suspended" | "trial";
        createdAt: Date;
    }[]>;
    createStore(dto: CreateStoreDto, user: RequestUser): Promise<{
        id: string;
        name: string;
        ownerEmail: string;
        plan: "Starter" | "Growth" | "Scale";
        region: string;
        gmvUsd: number;
        status: "active" | "suspended" | "trial";
        createdAt: Date;
    }>;
    updateStoreStatus(id: string, dto: UpdateStoreStatusDto, user: RequestUser): Promise<{
        id: string;
        name: string;
        ownerEmail: string;
        status: "active" | "suspended" | "trial";
        createdAt: Date;
    }>;
    deleteStore(id: string, user: RequestUser): Promise<{
        deleted: boolean;
        id: string;
        name: string;
    }>;
    lifecycle(): Promise<{
        storeId: string;
        storeName: string;
        publishStatus: string;
        domain: string;
        domainStatus: string;
        sslStatus: string;
        lastPublishedAt: string;
        lastThemeUpdateAt: string;
    }[]>;
    lifecycleByStore(storeId: string): Promise<{
        storeId: string;
        storeName: string;
        publishStatus: string;
        domain: string;
        domainStatus: string;
        sslStatus: string;
        lastPublishedAt: string;
        lastThemeUpdateAt: string;
    }>;
    updateLifecycle(storeId: string, dto: UpdateLifecycleDto, user: RequestUser): Promise<{
        storeId: string;
        storeName: string;
        publishStatus: string;
        domain: string;
        domainStatus: string;
        sslStatus: string;
        lastPublishedAt: string;
        lastThemeUpdateAt: string;
    }>;
    markThemeSynced(storeId: string, dto: ThemeSyncDto, user: RequestUser): Promise<{
        storeId: string;
        storeName: string;
        publishStatus: string;
        domain: string;
        domainStatus: string;
        sslStatus: string;
        lastPublishedAt: string;
        lastThemeUpdateAt: string;
    }>;
    admins(): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: string;
        lastActive: string;
    }[]>;
    inviteAdmin(dto: InviteAdminDto, user: RequestUser): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: string;
        lastActive: string;
    }>;
    updateAdminStatus(id: string, dto: UpdateAdminStatusDto, user: RequestUser): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: string;
        lastActive: string;
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
        id: string;
        storeId: string;
        storeName: string;
        ownerEmail: string;
        plan: "Starter" | "Growth" | "Scale";
        status: "active" | "cancelled" | "trial" | "past_due";
        amountUsd: number;
        nextBillingDate: string;
        expiryDate: string;
        lastPaymentDate: string;
        failedPaymentCount: number;
    }[]>;
    syncSubscriptionPricing(user: RequestUser): Promise<{
        updated: number;
        skipped: number;
        prices: Record<"Starter" | "Growth" | "Scale", number>;
    }>;
    subscriptionByStore(storeId: string): Promise<{
        id: string;
        storeId: string;
        storeName: string;
        ownerEmail: string;
        plan: "Starter" | "Growth" | "Scale";
        status: "active" | "cancelled" | "trial" | "past_due";
        amountUsd: number;
        nextBillingDate: string;
        expiryDate: string;
        lastPaymentDate: string;
        failedPaymentCount: number;
    }>;
    updateSubscription(storeId: string, dto: SubscriptionUpdateDto, user: RequestUser): Promise<{
        id: string;
        storeId: string;
        storeName: string;
        ownerEmail: string;
        plan: "Starter" | "Growth" | "Scale";
        status: "active" | "cancelled" | "trial" | "past_due";
        amountUsd: number;
        nextBillingDate: string;
        expiryDate: string;
        lastPaymentDate: string;
        failedPaymentCount: number;
    }>;
    retrySubscription(storeId: string, user: RequestUser): Promise<{
        retried: boolean;
        storeId: string;
        result: {
            id: string;
            storeId: string;
            storeName: string;
            ownerEmail: string;
            plan: "Starter" | "Growth" | "Scale";
            status: "active" | "cancelled" | "trial" | "past_due";
            amountUsd: number;
            nextBillingDate: string;
            expiryDate: string;
            lastPaymentDate: string;
            failedPaymentCount: number;
        };
    }>;
    cancelSubscription(storeId: string, user: RequestUser): Promise<{
        cancelled: boolean;
        storeId: string;
        result: {
            id: string;
            storeId: string;
            storeName: string;
            ownerEmail: string;
            plan: "Starter" | "Growth" | "Scale";
            status: "active" | "cancelled" | "trial" | "past_due";
            amountUsd: number;
            nextBillingDate: string;
            expiryDate: string;
            lastPaymentDate: string;
            failedPaymentCount: number;
        };
    }>;
    paymentOps(): Promise<{
        storeId: string;
        storeName: string;
        stripeEnabled: boolean;
        stripeMode: "test" | "live";
        sslCommerzEnabled: boolean;
        sslCommerzMode: "test" | "live";
        codEnabled: boolean;
        failedCheckout24h: number;
        checkoutSuccessRatePct: number;
    }[]>;
    paymentOpsMetrics(): Promise<{
        totalTransactions: number;
        failedTransactions: number;
        successRatePct: number;
    }>;
    paymentOpsByStore(storeId: string): Promise<{
        storeId: string;
        storeName: string;
        stripeEnabled: boolean;
        stripeMode: "test" | "live";
        sslCommerzEnabled: boolean;
        sslCommerzMode: "test" | "live";
        codEnabled: boolean;
        failedCheckout24h: number;
        checkoutSuccessRatePct: number;
    }>;
    updatePaymentOps(storeId: string, dto: UpdatePaymentOpsDto, user: RequestUser): Promise<{
        storeId: string;
        storeName: string;
        stripeEnabled: boolean;
        stripeMode: "test" | "live";
        sslCommerzEnabled: boolean;
        sslCommerzMode: "test" | "live";
        codEnabled: boolean;
        failedCheckout24h: number;
        checkoutSuccessRatePct: number;
    }>;
    resetPaymentFailures(storeId: string, user: RequestUser): Promise<{
        storeId: string;
        storeName: string;
        stripeEnabled: boolean;
        stripeMode: "test" | "live";
        sslCommerzEnabled: boolean;
        sslCommerzMode: "test" | "live";
        codEnabled: boolean;
        failedCheckout24h: number;
        checkoutSuccessRatePct: number;
    }>;
    tickets(): Promise<{
        id: string;
        storeName: string;
        category: string;
        priority: string;
        status: string;
        slaHours: number;
        createdAt: string;
        note: string;
    }[]>;
    ticket(id: string): Promise<{
        id: string;
        storeName: string;
        category: string;
        priority: string;
        status: string;
        slaHours: number;
        createdAt: string;
        note: string;
    }>;
    updateTicket(id: string, dto: UpdateTicketDto, user: RequestUser): Promise<{
        id: string;
        storeName: string;
        category: string;
        priority: string;
        status: string;
        slaHours: number;
        createdAt: string;
        note: string;
    }>;
    securityIncidents(): Promise<{
        id: string;
        title: string;
        level: string;
        startedAt: string;
        status: string;
        note: string;
        resolutionNote: string;
        resolvedAt: string;
        updatedAt: string;
    }[]>;
    securityIncident(id: string): Promise<{
        id: string;
        title: string;
        level: string;
        startedAt: string;
        status: string;
        note: string;
        resolutionNote: string;
        resolvedAt: string;
        updatedAt: string;
    }>;
    createSecurityIncident(dto: CreateIncidentDto, user: RequestUser): Promise<{
        id: string;
        title: string;
        level: string;
        startedAt: string;
        status: string;
        note: string;
        resolutionNote: string;
        resolvedAt: string;
        updatedAt: string;
    }>;
    updateSecurityIncident(id: string, dto: UpdateIncidentDto, user: RequestUser): Promise<{
        id: string;
        title: string;
        level: string;
        startedAt: string;
        status: string;
        note: string;
        resolutionNote: string;
        resolvedAt: string;
        updatedAt: string;
    }>;
    rotatePlatformKeys(user: RequestUser): Promise<{
        rotated: boolean;
        keyVersion: number;
        keyId: string;
        rotatedAt: string;
    }>;
    health(): Promise<{
        status: string;
        maintenanceMode: boolean;
        services: {
            name: string;
            uptimePct: number;
            latencyMs: number;
            status: string;
        }[];
        generatedAt: string;
    }>;
    setMaintenanceMode(dto: SetMaintenanceModeDto, user: RequestUser): Promise<{
        enabled: boolean;
        updatedAt: string;
    }>;
    restartService(service: string): {
        service: string;
        restarted: boolean;
        mode: string;
    };
    aiUsage(): Promise<{
        models: {
            model: string;
            requests: number;
            tokens: number;
            costUsd: number;
            quotaPct: number;
        }[];
        grouped: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.AiGenerationJobGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        totals: {
            requests: number;
            completed: number;
            failed: number;
        };
        hardCapUsd: number;
        utilizationPct: number;
    }>;
    updateAiHardCap(dto: UpdateAiHardCapDto, user: RequestUser): Promise<{
        hardCapUsd: number;
        updatedAt: string;
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
    auditLogs(query: AuditLogQueryDto): Promise<({
        actor: {
            email: string;
            name: string;
        } | null;
    } & {
        id: string;
        role: import(".prisma/client").$Enums.Role | null;
        createdAt: Date;
        action: string;
        entityType: string;
        entityId: string;
        metaJson: import("@prisma/client/runtime/library").JsonValue | null;
        actorUserId: string | null;
    })[] | {
        id: string;
        actor: string;
        action: string;
        target: string;
        risk: "low" | "high" | "medium";
        at: string;
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
