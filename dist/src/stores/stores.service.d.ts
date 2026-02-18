import { Prisma, Role, StoreStatus } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class StoresService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    create(ownerId: string, data: {
        name: string;
        slug: string;
        themePreset?: string;
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
    list(user: {
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
    }[]>;
    findOne(id: string): Prisma.Prisma__StoreClient<({
        trackingConfig: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            pixelId: string | null;
            gtmId: string | null;
            capiToken: string | null;
            extraJson: Prisma.JsonValue | null;
        } | null;
        themeConfig: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            preset: string | null;
            customJson: Prisma.JsonValue | null;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        slug: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        themePreset: string | null;
        publishedAt: Date | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: {
        name?: string;
        slug?: string;
        themePreset?: string;
        status?: StoreStatus;
    }, actor: {
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
    publish(id: string, actor: {
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
    upsertTracking(storeId: string, data: {
        pixelId?: string;
        gtmId?: string;
        capiToken?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        pixelId: string | null;
        gtmId: string | null;
        capiToken: string | null;
        extraJson: Prisma.JsonValue | null;
    }>;
    upsertTheme(storeId: string, data: {
        preset?: string;
        customJson?: Record<string, unknown>;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        preset: string | null;
        customJson: Prisma.JsonValue | null;
    }>;
    assertStoreAccess(storeId: string, user: {
        id: string;
        role: Role;
    }): Promise<void>;
}
