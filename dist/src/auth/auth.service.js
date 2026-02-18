"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt_1 = require("bcrypt");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../common/audit.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, auditService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.auditService = auditService;
    }
    async signup(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already in use');
        }
        const passwordHash = await (0, bcrypt_1.hash)(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                role: client_1.Role.owner,
            },
        });
        await this.auditService.log({
            actorUserId: user.id,
            role: user.role,
            action: 'auth.signup',
            entityType: 'User',
            entityId: user.id,
            metaJson: { email: user.email },
        });
        return this.issueTokens({
            id: user.id,
            email: user.email,
            role: user.role,
        });
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await (0, bcrypt_1.compare)(dto.password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.issueTokens({
            id: user.id,
            email: user.email,
            role: user.role,
        });
    }
    async refresh(dto) {
        try {
            const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
            });
            const tokenRecord = await this.prisma.refreshToken.findUnique({
                where: { jti: payload.jti },
            });
            if (!tokenRecord ||
                tokenRecord.userId !== payload.sub ||
                tokenRecord.revokedAt ||
                tokenRecord.expiresAt < new Date()) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            await this.prisma.refreshToken.update({
                where: { id: tokenRecord.id },
                data: { revokedAt: new Date() },
            });
            return this.issueTokens({
                id: payload.sub,
                email: payload.email,
                role: payload.role,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(dto) {
        try {
            const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
            });
            await this.prisma.refreshToken.updateMany({
                where: { jti: payload.jti, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        catch {
        }
        return { success: true };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user)
            return { success: true };
        const rawToken = (0, crypto_1.randomUUID)();
        const tokenHash = this.sha256(rawToken);
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 1000 * 60 * 30),
            },
        });
        return { success: true, resetToken: rawToken };
    }
    async resetPassword(dto) {
        const tokenHash = this.sha256(dto.token);
        const token = await this.prisma.passwordResetToken.findFirst({
            where: {
                tokenHash,
                consumedAt: null,
                expiresAt: { gt: new Date() },
            },
            include: { user: true },
        });
        if (!token) {
            throw new common_1.UnauthorizedException('Invalid or expired reset token');
        }
        const newHash = await (0, bcrypt_1.hash)(dto.newPassword, 10);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: token.userId },
                data: { passwordHash: newHash },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: token.id },
                data: { consumedAt: new Date() },
            }),
        ]);
        await this.auditService.log({
            actorUserId: token.userId,
            role: token.user.role,
            action: 'auth.password_reset',
            entityType: 'User',
            entityId: token.userId,
        });
        return { success: true };
    }
    async me(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
    }
    googleStart(redirectUri) {
        const fakeState = (0, crypto_1.randomUUID)();
        const callback = redirectUri?.trim() || 'http://localhost:4000/api/auth/google/callback';
        return {
            provider: 'google',
            authUrl: `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=openid%20email%20profile&state=${fakeState}&redirect_uri=${encodeURIComponent(callback)}`,
            state: fakeState,
            note: 'Use callback endpoint with code/state for local simulation',
        };
    }
    async googleCallback(params) {
        if (!params.code && !params.email) {
            throw new common_1.UnauthorizedException('Missing OAuth code or email');
        }
        const normalizedEmail = params.email?.trim().toLowerCase() || `google_user_${Date.now()}@1mis.io`;
        let user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    name: normalizedEmail.split('@')[0],
                    email: normalizedEmail,
                    passwordHash: await (0, bcrypt_1.hash)((0, crypto_1.randomUUID)(), 10),
                    role: client_1.Role.owner,
                },
            });
        }
        await this.auditService.log({
            actorUserId: user.id,
            role: user.role,
            action: 'auth.google_callback',
            entityType: 'User',
            entityId: user.id,
            metaJson: { state: params.state ?? null },
        });
        return this.issueTokens({
            id: user.id,
            email: user.email,
            role: user.role,
        });
    }
    async issueTokens(user) {
        const jti = (0, crypto_1.randomUUID)();
        const refreshExpiry = this.parseExpiryMs(this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'), 1000 * 60 * 60 * 24 * 7);
        const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, role: user.role }, {
            secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
        });
        const refreshToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, role: user.role, jti }, {
            secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                jti,
                expiresAt: new Date(Date.now() + refreshExpiry),
            },
        });
        return {
            user,
            accessToken,
            refreshToken,
        };
    }
    parseExpiryMs(raw, fallback) {
        const match = raw.trim().match(/^(\d+)([smhd])$/i);
        if (!match)
            return fallback;
        const value = Number(match[1]);
        const unit = match[2].toLowerCase();
        if (unit === 's')
            return value * 1000;
        if (unit === 'm')
            return value * 60_000;
        if (unit === 'h')
            return value * 3_600_000;
        if (unit === 'd')
            return value * 86_400_000;
        return fallback;
    }
    sha256(value) {
        return (0, crypto_1.createHash)('sha256').update(value).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map