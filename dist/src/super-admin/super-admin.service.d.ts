import { Prisma, Role, StoreStatus } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
type DashboardStoreStatus = 'active' | 'trial' | 'suspended';
type DashboardPlan = 'Starter' | 'Growth' | 'Scale';
type DashboardSubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled';
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
    stores(): Promise<{
        id: string;
        name: string;
        ownerEmail: string;
        plan: DashboardPlan;
        region: string;
        gmvUsd: number;
        status: DashboardStoreStatus;
        createdAt: Date;
    }[]>;
    createStore(data: {
        name: string;
        ownerEmail: string;
        plan?: 'Starter' | 'Growth' | 'Scale';
        region?: string;
        status?: 'active' | 'trial' | 'suspended';
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        ownerEmail: string;
        plan: DashboardPlan;
        region: string;
        gmvUsd: number;
        status: "active" | "suspended" | "trial";
        createdAt: Date;
    }>;
    updateStoreStatus(id: string, status: StoreStatus, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        ownerEmail: string;
        status: DashboardStoreStatus;
        createdAt: Date;
    }>;
    deleteStore(id: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    updateLifecycle(storeId: string, payload: {
        publishStatus?: string;
        domainStatus?: string;
        sslStatus?: string;
        notes?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        storeId: string;
        storeName: string;
        publishStatus: string;
        domain: string;
        domainStatus: string;
        sslStatus: string;
        lastPublishedAt: string;
        lastThemeUpdateAt: string;
    }>;
    markThemeSynced(storeId: string, at: string | undefined, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    inviteAdmin(data: {
        name: string;
        email: string;
        role: Role;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: string;
        lastActive: string;
    }>;
    updateAdminStatus(id: string, isActive: boolean, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        status: string;
        lastActive: string;
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
        id: string;
        storeId: string;
        storeName: string;
        ownerEmail: string;
        plan: DashboardPlan;
        status: DashboardSubscriptionStatus;
        amountUsd: number;
        nextBillingDate: string;
        expiryDate: string;
        lastPaymentDate: string;
        failedPaymentCount: number;
    }[]>;
    subscriptionByStore(storeId: string): Promise<{
        id: string;
        storeId: string;
        storeName: string;
        ownerEmail: string;
        plan: DashboardPlan;
        status: DashboardSubscriptionStatus;
        amountUsd: number;
        nextBillingDate: string;
        expiryDate: string;
        lastPaymentDate: string;
        failedPaymentCount: number;
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
        id: string;
        storeId: string;
        storeName: string;
        ownerEmail: string;
        plan: DashboardPlan;
        status: DashboardSubscriptionStatus;
        amountUsd: number;
        nextBillingDate: string;
        expiryDate: string;
        lastPaymentDate: string;
        failedPaymentCount: number;
    }>;
    retrySubscription(storeId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        retried: boolean;
        storeId: string;
        result: {
            id: string;
            storeId: string;
            storeName: string;
            ownerEmail: string;
            plan: DashboardPlan;
            status: DashboardSubscriptionStatus;
            amountUsd: number;
            nextBillingDate: string;
            expiryDate: string;
            lastPaymentDate: string;
            failedPaymentCount: number;
        };
    }>;
    cancelSubscription(storeId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        cancelled: boolean;
        storeId: string;
        result: {
            id: string;
            storeId: string;
            storeName: string;
            ownerEmail: string;
            plan: DashboardPlan;
            status: DashboardSubscriptionStatus;
            amountUsd: number;
            nextBillingDate: string;
            expiryDate: string;
            lastPaymentDate: string;
            failedPaymentCount: number;
        };
    }>;
    syncSubscriptionPricing(actor: {
        id: string;
        role: Role;
    }): Promise<{
        updated: number;
        skipped: number;
        prices: Record<DashboardPlan, number>;
    }>;
    paymentOps(): Promise<{
        storeId: string;
        storeName: string;
        stripeEnabled: boolean;
        stripeMode: "live" | "test";
        sslCommerzEnabled: boolean;
        sslCommerzMode: "live" | "test";
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
        stripeMode: "live" | "test";
        sslCommerzEnabled: boolean;
        sslCommerzMode: "live" | "test";
        codEnabled: boolean;
        failedCheckout24h: number;
        checkoutSuccessRatePct: number;
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
        storeId: string;
        storeName: string;
        stripeEnabled: boolean;
        stripeMode: "live" | "test";
        sslCommerzEnabled: boolean;
        sslCommerzMode: "live" | "test";
        codEnabled: boolean;
        failedCheckout24h: number;
        checkoutSuccessRatePct: number;
    }>;
    resetPaymentFailures(storeId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        storeId: string;
        storeName: string;
        stripeEnabled: boolean;
        stripeMode: "live" | "test";
        sslCommerzEnabled: boolean;
        sslCommerzMode: "live" | "test";
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
    updateTicket(id: string, payload: {
        status: 'open' | 'in_progress' | 'resolved';
        note?: string;
        priority?: 'low' | 'medium' | 'high';
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    createSecurityIncident(payload: {
        title: string;
        level: 'info' | 'warning' | 'critical';
        status?: 'monitoring' | 'resolved';
        startedAt?: string;
        note?: string;
        resolutionNote?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    updateSecurityIncident(id: string, payload: {
        title?: string;
        level?: 'info' | 'warning' | 'critical';
        status?: 'monitoring' | 'resolved';
        note?: string;
        resolutionNote?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    restartService(service: string): {
        service: string;
        restarted: boolean;
        mode: string;
    };
    setMaintenanceMode(enabled: boolean, actor: {
        id: string;
        role: Role;
    }): Promise<{
        enabled: boolean;
        updatedAt: string;
    }>;
    aiUsage(): Promise<{
        models: {
            model: string;
            requests: number;
            tokens: number;
            costUsd: number;
            quotaPct: number;
        }[];
        grouped: (Prisma.PickEnumerable<Prisma.AiGenerationJobGroupByOutputType, "status"[]> & {
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
    updateAiHardCap(hardCapUsd: number, actor: {
        id: string;
        role: Role;
    }): Promise<{
        hardCapUsd: number;
        updatedAt: string;
    }>;
    rotatePlatformKeys(actor: {
        id: string;
        role: Role;
    }): Promise<{
        rotated: boolean;
        keyVersion: number;
        keyId: string;
        rotatedAt: string;
    }>;
    flags(): Prisma.PrismaPromise<{
        key: string;
        updatedAt: Date;
        description: string | null;
        enabled: boolean;
        rolloutPct: number;
    }[]>;
    upsertFlag(key: string, enabled: boolean, description: string | undefined, rolloutPct: number | undefined, actor: {
        id: string;
        role: Role;
    }): Promise<{
        key: string;
        updatedAt: Date;
        description: string | null;
        enabled: boolean;
        rolloutPct: number;
    }>;
    auditLogs(format?: 'dashboard'): Promise<({
        actor: {
            name: string;
            email: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.Role | null;
        action: string;
        entityType: string;
        entityId: string;
        metaJson: Prisma.JsonValue | null;
        actorUserId: string | null;
    })[] | {
        id: string;
        actor: string;
        action: string;
        target: string;
        risk: "low" | "high" | "medium";
        at: string;
    }[]>;
    settings(): Prisma.PrismaPromise<{
        key: string;
        updatedAt: Date;
        valueJson: Prisma.JsonValue;
    }[]>;
    upsertSetting(key: string, valueJson: Record<string, unknown>, actor: {
        id: string;
        role: Role;
    }): Promise<{
        key: string;
        updatedAt: Date;
        valueJson: Prisma.JsonValue;
    }>;
    upsertSettingsBatch(values: Record<string, Record<string, unknown>>, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updated: number;
    }>;
    private toSubscriptionRecord;
    private toDashboardStoreStatus;
    private dashboardStatusToStoreStatus;
    private subscriptionToStoreStatus;
    private normalizePlan;
    private normalizeSubscriptionStatus;
    private normalizeMode;
    private toAdminStatus;
    private toTicketRecord;
    private toIncidentRecord;
    private riskFromAction;
    private normalizeTicketCategory;
    private normalizeTicketPriority;
    private normalizeTicketStatus;
    private normalizeIncidentLevel;
    private normalizeIncidentStatus;
    private asRecord;
    private asString;
    private asNumber;
    private asBoolean;
    private slugify;
    private generateUniqueSlug;
}
export {};
