import { Role, StoreStatus } from '@prisma/client';
import { SuperAdminService } from './super-admin.service';
declare class UpdateStoreStatusDto {
    status: StoreStatus;
}
declare class InviteAdminDto {
    name: string;
    email: string;
    role: Role;
}
declare class UpdateFlagDto {
    enabled: boolean;
    description?: string;
}
declare class UpdateSettingDto {
    valueJson: Record<string, unknown>;
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
        createdAt: Date;
        name: string;
        ownerId: string;
        slug: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        themePreset: string | null;
        publishedAt: Date | null;
        updatedAt: Date;
    }[]>;
    updateStoreStatus(id: string, dto: UpdateStoreStatusDto): import(".prisma/client").Prisma.Prisma__StoreClient<{
        id: string;
        createdAt: Date;
        name: string;
        ownerId: string;
        slug: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        themePreset: string | null;
        publishedAt: Date | null;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    lifecycle(): import(".prisma/client").Prisma.GetStoreGroupByPayload<{
        by: "status"[];
        _count: true;
    }>;
    lifecycleByStore(storeId: string): import(".prisma/client").Prisma.Prisma__StoreClient<{
        id: string;
        createdAt: Date;
        name: string;
        ownerId: string;
        slug: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        themePreset: string | null;
        publishedAt: Date | null;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    admins(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        name: string;
        email: string;
        isActive: boolean;
    }[]>;
    inviteAdmin(dto: InviteAdminDto): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        name: string;
        email: string;
    }>;
    subscriptions(): {
        plans: string[];
        note: string;
    };
    paymentOps(): {
        status: string;
        message: string;
    };
    paymentOpsByStore(storeId: string): {
        storeId: string;
        status: string;
        message: string;
    };
    tickets(): {
        items: never[];
        note: string;
    };
    ticket(id: string): {
        id: string;
        status: string;
        note: string;
    };
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
    upsertFlag(key: string, dto: UpdateFlagDto): import(".prisma/client").Prisma.Prisma__FeatureFlagClient<{
        updatedAt: Date;
        description: string | null;
        key: string;
        enabled: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    auditLogs(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        role: import(".prisma/client").$Enums.Role | null;
        action: string;
        entityType: string;
        entityId: string;
        metaJson: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        actorUserId: string | null;
    }[]>;
    settings(): import(".prisma/client").Prisma.PrismaPromise<{
        updatedAt: Date;
        key: string;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    upsertSetting(key: string, dto: UpdateSettingDto): import(".prisma/client").Prisma.Prisma__PlatformSettingClient<{
        updatedAt: Date;
        key: string;
        valueJson: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
