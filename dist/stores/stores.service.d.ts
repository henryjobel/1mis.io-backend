import { Prisma, Role, StoreStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class StoresService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(ownerId: string, data: {
        name: string;
        slug: string;
        themePreset?: string;
    }): Prisma.Prisma__StoreClient<{
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
    list(user: {
        id: string;
        role: Role;
    }): Promise<{
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
    findOne(id: string): Prisma.Prisma__StoreClient<({
        trackingConfig: {
            id: string;
            createdAt: Date;
            storeId: string;
            updatedAt: Date;
            pixelId: string | null;
            gtmId: string | null;
            capiToken: string | null;
            extraJson: Prisma.JsonValue | null;
        } | null;
        themeConfig: {
            id: string;
            createdAt: Date;
            storeId: string;
            updatedAt: Date;
            preset: string | null;
            customJson: Prisma.JsonValue | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        name: string;
        ownerId: string;
        slug: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        themePreset: string | null;
        publishedAt: Date | null;
        updatedAt: Date;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: {
        name?: string;
        slug?: string;
        themePreset?: string;
        status?: StoreStatus;
    }): Prisma.Prisma__StoreClient<{
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
    publish(id: string): Prisma.Prisma__StoreClient<{
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
    upsertTracking(storeId: string, data: {
        pixelId?: string;
        gtmId?: string;
        capiToken?: string;
    }): Prisma.Prisma__TrackingConfigClient<{
        id: string;
        createdAt: Date;
        storeId: string;
        updatedAt: Date;
        pixelId: string | null;
        gtmId: string | null;
        capiToken: string | null;
        extraJson: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    upsertTheme(storeId: string, data: {
        preset?: string;
        customJson?: Record<string, unknown>;
    }): Prisma.Prisma__ThemeConfigClient<{
        id: string;
        createdAt: Date;
        storeId: string;
        updatedAt: Date;
        preset: string | null;
        customJson: Prisma.JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    assertStoreAccess(storeId: string, user: {
        id: string;
        role: Role;
    }): Promise<void>;
}
