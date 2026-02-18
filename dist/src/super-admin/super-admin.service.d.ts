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
    stores(): Prisma.PrismaPromise<{
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        slug: string;
        themePreset: string | null;
        publishedAt: Date | null;
    }[]>;
    updateStoreStatus(id: string, status: StoreStatus, actor: {
        id: string;
        role: Role;
    }): Promise<{
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        slug: string;
        themePreset: string | null;
        publishedAt: Date | null;
    }>;
    lifecycle(): Prisma.GetStoreGroupByPayload<{
        by: "status"[];
        _count: true;
    }>;
    lifecycleByStore(storeId: string): Promise<{
        store: {
            name: string;
            id: string;
            status: import(".prisma/client").$Enums.StoreStatus;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            slug: string;
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
        name: string;
        id: string;
        email: string;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    inviteAdmin(data: {
        name: string;
        email: string;
        role: Role;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        name: string;
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    subscriptions(): {
        plans: string[];
        note: string;
    };
    paymentOps(): {
        status: string;
        message: string;
    };
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
        description: string | null;
        key: string;
        enabled: boolean;
    }[]>;
    upsertFlag(key: string, enabled: boolean, description: string | undefined, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updatedAt: Date;
        description: string | null;
        key: string;
        enabled: boolean;
    }>;
    auditLogs(): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        role: import(".prisma/client").$Enums.Role | null;
        actorUserId: string | null;
        action: string;
        entityType: string;
        entityId: string;
        metaJson: Prisma.JsonValue | null;
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
