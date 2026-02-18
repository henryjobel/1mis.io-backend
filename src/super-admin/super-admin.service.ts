import { Injectable } from '@nestjs/common';
import { Prisma, Role, StoreStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [stores, users, orders, aiJobs] = await Promise.all([
      this.prisma.store.count(),
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.aiGenerationJob.count(),
    ]);

    return { stores, users, orders, aiJobs };
  }

  stores() {
    return this.prisma.store.findMany({ orderBy: { createdAt: 'desc' } });
  }

  updateStoreStatus(id: string, status: StoreStatus) {
    return this.prisma.store.update({ where: { id }, data: { status } });
  }

  lifecycle() {
    return this.prisma.store.groupBy({ by: ['status'], _count: true });
  }

  lifecycleByStore(storeId: string) {
    return this.prisma.store.findUnique({ where: { id: storeId } });
  }

  admins() {
    return this.prisma.user.findMany({
      where: { role: { in: [Role.super_admin, Role.ops, Role.support, Role.finance] } },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }

  async inviteAdmin(data: { name: string; email: string; role: Role }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: 'invite-pending',
        role: data.role,
      },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  subscriptions() {
    return { plans: ['starter', 'growth', 'scale'], note: 'Subscription engine placeholder' };
  }

  paymentOps() {
    return { status: 'ok', message: 'Global payment operations placeholder' };
  }

  paymentOpsByStore(storeId: string) {
    return { storeId, status: 'ok', message: 'Store payment ops placeholder' };
  }

  tickets() {
    return { items: [], note: 'Ticketing placeholder' };
  }

  ticket(id: string) {
    return { id, status: 'open', note: 'Ticket details placeholder' };
  }

  health() {
    return { status: 'healthy', services: ['api', 'postgres', 'redis'] };
  }

  restartService(service: string) {
    return { service, restarted: true, mode: 'simulated' };
  }

  async aiUsage() {
    const grouped = await this.prisma.aiGenerationJob.groupBy({ by: ['status'], _count: true });
    return { grouped };
  }

  flags() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  upsertFlag(key: string, enabled: boolean, description?: string) {
    return this.prisma.featureFlag.upsert({
      where: { key },
      create: { key, enabled, description },
      update: { enabled, description },
    });
  }

  auditLogs() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  settings() {
    return this.prisma.platformSetting.findMany({ orderBy: { key: 'asc' } });
  }

  upsertSetting(key: string, valueJson: Record<string, unknown>) {
    return this.prisma.platformSetting.upsert({
      where: { key },
      create: { key, valueJson: valueJson as Prisma.InputJsonValue },
      update: { valueJson: valueJson as Prisma.InputJsonValue },
    });
  }
}
