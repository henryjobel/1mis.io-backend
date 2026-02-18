import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  list(storeId: string) {
    return this.prisma.storeMember.findMany({
      where: { storeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async invite(
    storeId: string,
    data: { name: string; email: string; roleInStore: string },
    actor: { id: string; role: Role },
  ) {
    const user =
      (await this.prisma.user.findUnique({ where: { email: data.email } })) ??
      (await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: 'invite-pending',
          role: Role.staff,
        },
      }));

    const member = await this.prisma.storeMember.upsert({
      where: { storeId_userId: { storeId, userId: user.id } },
      create: { storeId, userId: user.id, roleInStore: data.roleInStore },
      update: { roleInStore: data.roleInStore },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.member.invite',
      entityType: 'StoreMember',
      entityId: `${storeId}:${user.id}`,
      metaJson: { roleInStore: data.roleInStore },
    });

    return member;
  }

  async updateRole(
    storeId: string,
    userId: string,
    data: { roleInStore?: string },
    actor: { id: string; role: Role },
  ) {
    const member = await this.prisma.storeMember.update({
      where: { storeId_userId: { storeId, userId } },
      data: { roleInStore: data.roleInStore },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.member.role.update',
      entityType: 'StoreMember',
      entityId: `${storeId}:${userId}`,
      metaJson: { roleInStore: data.roleInStore },
    });

    return member;
  }

  async remove(
    storeId: string,
    userId: string,
    actor: { id: string; role: Role },
  ) {
    const member = await this.prisma.storeMember.delete({
      where: { storeId_userId: { storeId, userId } },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.member.remove',
      entityType: 'StoreMember',
      entityId: `${storeId}:${userId}`,
    });

    return member;
  }
}
