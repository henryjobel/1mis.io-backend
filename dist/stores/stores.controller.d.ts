import { StoreStatus } from '@prisma/client';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { StoresService } from './stores.service';
declare class CreateStoreDto {
    name: string;
    slug: string;
    themePreset?: string;
}
declare class UpdateStoreDto {
    name?: string;
    slug?: string;
    themePreset?: string;
    status?: StoreStatus;
}
declare class UpdateTrackingDto {
    pixelId?: string;
    gtmId?: string;
    capiToken?: string;
}
declare class UpdateThemeDto {
    preset?: string;
    customJson?: Record<string, unknown>;
}
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    create(user: RequestUser, dto: CreateStoreDto): import(".prisma/client").Prisma.Prisma__StoreClient<{
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
    list(user: RequestUser): Promise<{
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
    findOne(id: string): import(".prisma/client").Prisma.Prisma__StoreClient<({
        trackingConfig: {
            id: string;
            createdAt: Date;
            storeId: string;
            updatedAt: Date;
            pixelId: string | null;
            gtmId: string | null;
            capiToken: string | null;
            extraJson: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        themeConfig: {
            id: string;
            createdAt: Date;
            storeId: string;
            updatedAt: Date;
            preset: string | null;
            customJson: import("@prisma/client/runtime/library").JsonValue | null;
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
    update(id: string, dto: UpdateStoreDto): import(".prisma/client").Prisma.Prisma__StoreClient<{
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
    publish(id: string): import(".prisma/client").Prisma.Prisma__StoreClient<{
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
    updateTracking(id: string, dto: UpdateTrackingDto): import(".prisma/client").Prisma.Prisma__TrackingConfigClient<{
        id: string;
        createdAt: Date;
        storeId: string;
        updatedAt: Date;
        pixelId: string | null;
        gtmId: string | null;
        capiToken: string | null;
        extraJson: import("@prisma/client/runtime/library").JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateTheme(id: string, dto: UpdateThemeDto): import(".prisma/client").Prisma.Prisma__ThemeConfigClient<{
        id: string;
        createdAt: Date;
        storeId: string;
        updatedAt: Date;
        preset: string | null;
        customJson: import("@prisma/client/runtime/library").JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
