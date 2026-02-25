import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuditService } from '../common/audit.service';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly auditService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, auditService: AuditService);
    signup(dto: SignupDto): Promise<{
        user: {
            id: string;
            email: string;
            role: Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            role: Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(dto: RefreshDto): Promise<{
        user: {
            id: string;
            email: string;
            role: Role;
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
    me(userId: string): Promise<{
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
    } | null>;
    googleStart(redirectUri?: string): {
        provider: string;
        authUrl: string;
        state: `${string}-${string}-${string}-${string}-${string}`;
        note: string;
    };
    googleCallback(params: {
        code?: string;
        state?: string;
        email?: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            role: Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    private issueTokens;
    private parseExpiryMs;
    private sha256;
}
