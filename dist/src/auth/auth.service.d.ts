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
        name: string;
        id: string;
        createdAt: Date;
        email: string;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
    } | null>;
    private issueTokens;
    private parseExpiryMs;
    private sha256;
}
