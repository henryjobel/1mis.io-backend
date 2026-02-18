import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestUser } from '../interfaces/request-user.interface';

const SUPER_ROLES: Role[] = [
  Role.super_admin,
  Role.ops,
  Role.support,
  Role.finance,
];

@Injectable()
export class StoreAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      user?: RequestUser;
      params: Record<string, string | undefined>;
    }>();

    const user = req.user;
    if (!user) return false;

    if (SUPER_ROLES.includes(user.role)) {
      return true;
    }

    const storeId = req.params.id ?? req.params.storeId;
    if (!storeId) return true;

    const owned = await this.prisma.store.findFirst({
      where: { id: storeId, ownerId: user.id },
      select: { id: true },
    });
    if (owned) return true;

    const member = await this.prisma.storeMember.findUnique({
      where: {
        storeId_userId: {
          storeId,
          userId: user.id,
        },
      },
      select: { storeId: true },
    });

    return !!member;
  }
}
