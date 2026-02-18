import { Prisma, Role, StoreStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class SuperAdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(): Promise<{
        stores: number;
        users: number;
        orders: number;
        aiJobs: number;
    }>;
    stores(): Prisma.PrismaPromise<{
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
    updateStoreStatus(id: string, status: StoreStatus): Prisma.Prisma__StoreClient<{
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
    lifecycle(): Prisma.GetStoreGroupByPayload<{
        by: "status"[];
        _count: true;
    }>;
    lifecycleByStore(storeId: string): Prisma.Prisma__StoreClient<{
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
    admins(): Prisma.PrismaPromise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        name: string;
        email: string;
        isActive: boolean;
    }[]>;
    inviteAdmin(data: {
        name: string;
        email: string;
        role: Role;
    }): Promise<{
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
    upsertFlag(key: string, enabled: boolean, description?: string): Prisma.Prisma__FeatureFlagClient<{
        updatedAt: Date;
        description: string | null;
        key: string;
        enabled: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    auditLogs(): Prisma.PrismaPromise<{
        id: string;
        role: import(".prisma/client").$Enums.Role | null;
        action: string;
        entityType: string;
        entityId: string;
        metaJson: Prisma.JsonValue | null;
        createdAt: Date;
        actorUserId: string | null;
    }[]>;
    settings(): Prisma.PrismaPromise<{
        updatedAt: Date;
        key: string;
        valueJson: Prisma.JsonValue;
    }[]>;
    upsertSetting(key: string, valueJson: Record<string, unknown>): Prisma.Prisma__PlatformSettingClient<{
        updatedAt: Date;
        key: string;
        valueJson: Prisma.JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
