import { RequestUser } from '../common/interfaces/request-user.interface';
import { UsersService } from './users.service';
declare class UpdateMeDto {
    name?: string;
    businessName?: string;
    email?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: RequestUser): Promise<{
        [x: string]: ({
            id: string;
            role: import(".prisma/client").$Enums.Role | null;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string;
            metaJson: import("@prisma/client/runtime/library").JsonValue | null;
            actorUserId: string | null;
        } | {
            id: string;
            role: import(".prisma/client").$Enums.Role | null;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string;
            metaJson: import("@prisma/client/runtime/library").JsonValue | null;
            actorUserId: string | null;
        })[] | ({
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            slug: string;
            status: import(".prisma/client").$Enums.StoreStatus;
            themePreset: string | null;
            publishedAt: Date | null;
        } | {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            slug: string;
            status: import(".prisma/client").$Enums.StoreStatus;
            themePreset: string | null;
            publishedAt: Date | null;
        })[] | ({
            createdAt: Date;
            storeId: string;
            userId: string;
            roleInStore: string;
        } | {
            createdAt: Date;
            storeId: string;
            userId: string;
            roleInStore: string;
        })[] | ({
            id: string;
            createdAt: Date;
            userId: string;
            jti: string;
            expiresAt: Date;
            revokedAt: Date | null;
        } | {
            id: string;
            createdAt: Date;
            userId: string;
            jti: string;
            expiresAt: Date;
            revokedAt: Date | null;
        })[] | ({
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date;
            tokenHash: string;
            consumedAt: Date | null;
        } | {
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date;
            tokenHash: string;
            consumedAt: Date | null;
        })[] | ({
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: import(".prisma/client").$Enums.AiJobStatus;
            requestedBy: string;
            prompt: string;
            inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
            resultJson: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
        } | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: import(".prisma/client").$Enums.AiJobStatus;
            requestedBy: string;
            prompt: string;
            inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
            resultJson: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
        })[] | ({
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            userId: string | null;
            sessionId: string | null;
        } | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            userId: string | null;
            sessionId: string | null;
        })[] | ({
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            userId: string | null;
            productId: string;
            customer: string | null;
            rating: number;
            title: string | null;
            comment: string | null;
            isApproved: boolean;
        } | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            userId: string | null;
            productId: string;
            customer: string | null;
            rating: number;
            title: string | null;
            comment: string | null;
            isApproved: boolean;
        })[] | {
            id: string;
            role: import(".prisma/client").$Enums.Role | null;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string;
            metaJson: import("@prisma/client/runtime/library").JsonValue | null;
            actorUserId: string | null;
        }[] | {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            slug: string;
            status: import(".prisma/client").$Enums.StoreStatus;
            themePreset: string | null;
            publishedAt: Date | null;
        }[] | {
            createdAt: Date;
            storeId: string;
            userId: string;
            roleInStore: string;
        }[] | {
            id: string;
            createdAt: Date;
            userId: string;
            jti: string;
            expiresAt: Date;
            revokedAt: Date | null;
        }[] | {
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date;
            tokenHash: string;
            consumedAt: Date | null;
        }[] | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: import(".prisma/client").$Enums.AiJobStatus;
            requestedBy: string;
            prompt: string;
            inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
            resultJson: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
        }[] | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            userId: string | null;
            sessionId: string | null;
        }[] | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            userId: string | null;
            productId: string;
            customer: string | null;
            rating: number;
            title: string | null;
            comment: string | null;
            isApproved: boolean;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    }>;
    updateMe(user: RequestUser, dto: UpdateMeDto): Promise<{
        [x: string]: ({
            id: string;
            role: import(".prisma/client").$Enums.Role | null;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string;
            metaJson: import("@prisma/client/runtime/library").JsonValue | null;
            actorUserId: string | null;
        } | {
            id: string;
            role: import(".prisma/client").$Enums.Role | null;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string;
            metaJson: import("@prisma/client/runtime/library").JsonValue | null;
            actorUserId: string | null;
        })[] | ({
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            slug: string;
            status: import(".prisma/client").$Enums.StoreStatus;
            themePreset: string | null;
            publishedAt: Date | null;
        } | {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            slug: string;
            status: import(".prisma/client").$Enums.StoreStatus;
            themePreset: string | null;
            publishedAt: Date | null;
        })[] | ({
            createdAt: Date;
            storeId: string;
            userId: string;
            roleInStore: string;
        } | {
            createdAt: Date;
            storeId: string;
            userId: string;
            roleInStore: string;
        })[] | ({
            id: string;
            createdAt: Date;
            userId: string;
            jti: string;
            expiresAt: Date;
            revokedAt: Date | null;
        } | {
            id: string;
            createdAt: Date;
            userId: string;
            jti: string;
            expiresAt: Date;
            revokedAt: Date | null;
        })[] | ({
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date;
            tokenHash: string;
            consumedAt: Date | null;
        } | {
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date;
            tokenHash: string;
            consumedAt: Date | null;
        })[] | ({
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: import(".prisma/client").$Enums.AiJobStatus;
            requestedBy: string;
            prompt: string;
            inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
            resultJson: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
        } | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: import(".prisma/client").$Enums.AiJobStatus;
            requestedBy: string;
            prompt: string;
            inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
            resultJson: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
        })[] | ({
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            userId: string | null;
            sessionId: string | null;
        } | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            userId: string | null;
            sessionId: string | null;
        })[] | ({
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            userId: string | null;
            productId: string;
            customer: string | null;
            rating: number;
            title: string | null;
            comment: string | null;
            isApproved: boolean;
        } | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            userId: string | null;
            productId: string;
            customer: string | null;
            rating: number;
            title: string | null;
            comment: string | null;
            isApproved: boolean;
        })[] | {
            id: string;
            role: import(".prisma/client").$Enums.Role | null;
            createdAt: Date;
            action: string;
            entityType: string;
            entityId: string;
            metaJson: import("@prisma/client/runtime/library").JsonValue | null;
            actorUserId: string | null;
        }[] | {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            ownerId: string;
            slug: string;
            status: import(".prisma/client").$Enums.StoreStatus;
            themePreset: string | null;
            publishedAt: Date | null;
        }[] | {
            createdAt: Date;
            storeId: string;
            userId: string;
            roleInStore: string;
        }[] | {
            id: string;
            createdAt: Date;
            userId: string;
            jti: string;
            expiresAt: Date;
            revokedAt: Date | null;
        }[] | {
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date;
            tokenHash: string;
            consumedAt: Date | null;
        }[] | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: import(".prisma/client").$Enums.AiJobStatus;
            requestedBy: string;
            prompt: string;
            inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
            resultJson: import("@prisma/client/runtime/library").JsonValue | null;
            errorMessage: string | null;
        }[] | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            userId: string | null;
            sessionId: string | null;
        }[] | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            userId: string | null;
            productId: string;
            customer: string | null;
            rating: number;
            title: string | null;
            comment: string | null;
            isApproved: boolean;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    }>;
}
export {};
