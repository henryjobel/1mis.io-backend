import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuditService } from '../common/audit.service';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        businessName: dto.businessName?.trim() || null,
        email: dto.email,
        passwordHash,
        role: Role.owner,
      } as any,
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

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account is disabled');

    const ok = await compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  async refresh(dto: RefreshDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        role: Role;
        jti: string;
      }>(dto.refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { jti: payload.jti },
      });
      if (
        !tokenRecord ||
        tokenRecord.userId !== payload.sub ||
        tokenRecord.revokedAt ||
        tokenRecord.expiresAt < new Date()
      ) {
        throw new UnauthorizedException('Invalid refresh token');
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
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(dto: LogoutDto) {
    try {
      const payload = await this.jwtService.verifyAsync<{ jti: string }>(
        dto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      await this.prisma.refreshToken.updateMany({
        where: { jti: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // logout must be idempotent
    }

    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) return { success: true };

    const rawToken = randomUUID();
    const tokenHash = this.sha256(rawToken);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });

    // Placeholder: replace with real email service.
    return { success: true, resetToken: rawToken };
  }

  async resetPassword(dto: ResetPasswordDto) {
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
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const newHash = await hash(dto.newPassword, 10);

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

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      } as any,
    });
  }

  googleStart(redirectUri?: string) {
    const fakeState = randomUUID();
    const callback =
      redirectUri?.trim() || 'http://localhost:4000/api/auth/google/callback';
    return {
      provider: 'google',
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=openid%20email%20profile&state=${fakeState}&redirect_uri=${encodeURIComponent(callback)}`,
      state: fakeState,
      note: 'Use callback endpoint with code/state for local simulation',
    };
  }

  async googleCallback(params: {
    code?: string;
    state?: string;
    email?: string;
  }) {
    if (!params.code && !params.email) {
      throw new UnauthorizedException('Missing OAuth code or email');
    }

    const normalizedEmail =
      params.email?.trim().toLowerCase() || `google_user_${Date.now()}@1mis.io`;

    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: normalizedEmail.split('@')[0],
          email: normalizedEmail,
          passwordHash: await hash(randomUUID(), 10),
          role: Role.owner,
        } as any,
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

  private async issueTokens(user: { id: string; email: string; role: Role }) {
    const jti = randomUUID();
    const refreshExpiry = this.parseExpiryMs(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      1000 * 60 * 60 * 24 * 7,
    );

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ) as never,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role, jti },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
          '7d',
        ) as never,
      },
    );

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

  private parseExpiryMs(raw: string, fallback: number): number {
    const match = raw.trim().match(/^(\d+)([smhd])$/i);
    if (!match) return fallback;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 's') return value * 1000;
    if (unit === 'm') return value * 60_000;
    if (unit === 'h') return value * 3_600_000;
    if (unit === 'd') return value * 86_400_000;
    return fallback;
  }

  private sha256(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
