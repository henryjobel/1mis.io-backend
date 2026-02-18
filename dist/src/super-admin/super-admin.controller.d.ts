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
}
declare class UpdateSettingDto {
    valueJson: Record<string, unknown>;
}
declare class UpsertSettingsBatchDto {
    values: Record<string, Record<string, unknown>>;
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
        description: string | null;
        key: string;
        enabled: boolean;
    }[]>;
    upsertFlag(key: string, dto: UpdateFlagDto, user: RequestUser): Promise<{
        updatedAt: Date;
        description: string | null;
        key: string;
        enabled: boolean;
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
