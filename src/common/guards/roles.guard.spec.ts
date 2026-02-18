import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

function createContext(role?: Role): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows when no required roles', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(createContext(Role.owner))).toBe(true);
  });

  it('allows when user role matches', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.super_admin]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(createContext(Role.super_admin))).toBe(true);
  });

  it('blocks when user role mismatches', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.super_admin]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(createContext(Role.owner))).toBe(false);
  });
});
