import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(dto: SignupDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(dto: RefreshDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    logout(dto: LogoutDto): Promise<{
        success: boolean;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        resetToken?: undefined;
    } | {
        success: boolean;
        resetToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
    }>;
    googleStart(redirectUri?: string): {
        provider: string;
        authUrl: string;
        state: `${string}-${string}-${string}-${string}-${string}`;
        note: string;
    };
    googleCallback(code?: string, state?: string, email?: string): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    me(user: RequestUser): Promise<{
        [x: string]: ({
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.Role | null;
            action: string;
            entityType: string;
            entityId: string;
            metaJson: import("@prisma/client/runtime/library").JsonValue | null;
            actorUserId: string | null;
        } | {
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.Role | null;
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
        })[] | ({
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            userId: string;
            planId: string;
            startDate: Date;
            endDate: Date;
            cancelledAt: Date | null;
        } | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            userId: string;
            planId: string;
            startDate: Date;
            endDate: Date;
            cancelledAt: Date | null;
        })[] | {
            id: string;
            createdAt: Date;
            role: import(".prisma/client").$Enums.Role | null;
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
        }[] | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            userId: string;
            planId: string;
            startDate: Date;
            endDate: Date;
            cancelledAt: Date | null;
        }[];
        [x: number]: never;
        [x: symbol]: never;
    } | null>;
}
