import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  } as unknown as JwtService;

  const configService = {
    getOrThrow: jest.fn((key: string) => key),
    get: jest.fn((key: string, fallback: string) => fallback),
  };

  const auditService = {
    log: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('issues tokens on signup', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'u1',
      email: 'x@y.com',
      role: Role.owner,
    });
    (jwtService.signAsync as jest.Mock)
      .mockResolvedValueOnce('access')
      .mockResolvedValueOnce('refresh');
    prisma.refreshToken.create.mockResolvedValue({});

    const service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService,
      configService as unknown as ConfigService,
      auditService as unknown as AuditService,
    );
    const result = await service.signup({
      name: 'X',
      email: 'x@y.com',
      password: '123456',
    });

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
    expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid refresh', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('bad'));
    const service = new AuthService(
      prisma as unknown as PrismaService,
      jwtService,
      configService as unknown as ConfigService,
      auditService as unknown as AuditService,
    );

    await expect(
      service.refresh({ refreshToken: 'bad' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
