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
    create(user: RequestUser, dto: CreateStoreDto): Promise<{
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
    list(user: RequestUser): Promise<{
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
    findOne(id: string): import(".prisma/client").Prisma.Prisma__StoreClient<({
        trackingConfig: {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            pixelId: string | null;
            gtmId: string | null;
            capiToken: string | null;
            extraJson: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        themeConfig: {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            preset: string | null;
            customJson: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
    } & {
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        slug: string;
        themePreset: string | null;
        publishedAt: Date | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateStoreDto, user: RequestUser): Promise<{
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
    publish(id: string, user: RequestUser): Promise<{
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
    updateTracking(id: string, dto: UpdateTrackingDto, user: RequestUser): Promise<{
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        pixelId: string | null;
        gtmId: string | null;
        capiToken: string | null;
        extraJson: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    updateTheme(id: string, dto: UpdateThemeDto, user: RequestUser): Promise<{
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        preset: string | null;
        customJson: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
export {};
