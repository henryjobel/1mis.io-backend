import { ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StoreAccessGuard } from './store-access.guard';

function createContext(
  params: Record<string, string>,
  role: Role,
  userId = 'u1',
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        params,
        user: { id: userId, role, email: 'a@a.com' },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('StoreAccessGuard', () => {
  const prisma = {
    store: { findFirst: jest.fn() },
    storeMember: { findUnique: jest.fn() },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows super admin role', async () => {
    const guard = new StoreAccessGuard(prisma);
    await expect(
      guard.canActivate(createContext({ id: 's1' }, Role.super_admin)),
    ).resolves.toBe(true);
  });

  it('allows owner access', async () => {
    (prisma.store.findFirst as jest.Mock).mockResolvedValue({ id: 's1' });
    const guard = new StoreAccessGuard(prisma);
    await expect(
      guard.canActivate(createContext({ id: 's1' }, Role.owner)),
    ).resolves.toBe(true);
  });

  it('blocks non-member', async () => {
    (prisma.store.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.storeMember.findUnique as jest.Mock).mockResolvedValue(null);
    const guard = new StoreAccessGuard(prisma);
    await expect(
      guard.canActivate(createContext({ id: 's1' }, Role.staff)),
    ).resolves.toBe(false);
  });
});
