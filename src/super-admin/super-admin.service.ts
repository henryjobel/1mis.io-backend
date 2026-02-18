import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, StoreStatus } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

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

  async updateStoreStatus(
    id: string,
    status: StoreStatus,
    actor: { id: string; role: Role },
  ) {
    const store = await this.prisma.store.update({
      where: { id },
      data: { status },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.store.status',
      entityType: 'Store',
      entityId: id,
      metaJson: { status },
    });
    return store;
  }

  lifecycle() {
    return this.prisma.store.groupBy({ by: ['status'], _count: true });
  }

  async lifecycleByStore(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    const lifecycleConfig = await this.prisma.platformSetting.findUnique({
      where: { key: `lifecycle:${storeId}` },
    });

    return {
      store,
      lifecycleConfig: lifecycleConfig?.valueJson ?? null,
    };
  }

  async updateLifecycle(
    storeId: string,
    payload: {
      publishStatus?: string;
      domainStatus?: string;
      sslStatus?: string;
      notes?: string;
    },
    actor: { id: string; role: Role },
  ) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    const updated = await this.prisma.platformSetting.upsert({
      where: { key: `lifecycle:${storeId}` },
      create: {
        key: `lifecycle:${storeId}`,
        valueJson: payload as Prisma.InputJsonValue,
      },
      update: { valueJson: payload as Prisma.InputJsonValue },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.lifecycle.update',
      entityType: 'PlatformSetting',
      entityId: updated.key,
      metaJson: { storeId },
    });

    return updated;
  }

  admins() {
    return this.prisma.user.findMany({
      where: {
        role: { in: [Role.super_admin, Role.ops, Role.support, Role.finance] },
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }

  async inviteAdmin(
    data: { name: string; email: string; role: Role },
    actor: { id: string; role: Role },
  ) {
    const admin = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: 'invite-pending',
        role: data.role,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.admin.invite',
      entityType: 'User',
      entityId: admin.id,
      metaJson: { invitedRole: data.role },
    });

    return admin;
  }

  subscriptions() {
    return {
      plans: ['starter', 'growth', 'scale'],
      note: 'Subscription engine placeholder',
    };
  }

  paymentOps() {
    return { status: 'ok', message: 'Global payment operations placeholder' };
  }

  async paymentOpsByStore(storeId: string) {
    const config = await this.prisma.platformSetting.findUnique({
      where: { key: `payment_ops:${storeId}` },
    });
    return {
      storeId,
      config: config?.valueJson ?? null,
      message: 'Store payment ops configuration',
    };
  }

  async updatePaymentOps(
    storeId: string,
    payload: {
      stripeEnabled?: boolean;
      sslCommerzEnabled?: boolean;
      codEnabled?: boolean;
      mode?: 'test' | 'live';
    },
    actor: { id: string; role: Role },
  ) {
    const updated = await this.prisma.platformSetting.upsert({
      where: { key: `payment_ops:${storeId}` },
      create: {
        key: `payment_ops:${storeId}`,
        valueJson: payload as Prisma.InputJsonValue,
      },
      update: { valueJson: payload as Prisma.InputJsonValue },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.payment_ops.update',
      entityType: 'PlatformSetting',
      entityId: updated.key,
      metaJson: { storeId },
    });

    return updated;
  }

  async tickets() {
    const rows = await this.prisma.platformSetting.findMany({
      where: { key: { startsWith: 'ticket:' } },
      orderBy: { key: 'asc' },
    });

    return {
      items: rows.map((row) => ({
        id: row.key.replace('ticket:', ''),
        ...(row.valueJson as Record<string, unknown>),
      })),
      note: rows.length
        ? 'Ticket data loaded from platform settings'
        : 'Ticketing placeholder',
    };
  }

  async ticket(id: string) {
    const row = await this.prisma.platformSetting.findUnique({
      where: { key: `ticket:${id}` },
    });
    return {
      id,
      ...(row?.valueJson as Record<string, unknown> | undefined),
      note: row ? 'Ticket details' : 'Ticket details placeholder',
    };
  }

  async updateTicket(
    id: string,
    payload: {
      status: 'open' | 'in_progress' | 'resolved';
      note?: string;
      priority?: 'low' | 'medium' | 'high';
    },
    actor: { id: string; role: Role },
  ) {
    const updated = await this.prisma.platformSetting.upsert({
      where: { key: `ticket:${id}` },
      create: {
        key: `ticket:${id}`,
        valueJson: payload as Prisma.InputJsonValue,
      },
      update: { valueJson: payload as Prisma.InputJsonValue },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.ticket.update',
      entityType: 'PlatformSetting',
      entityId: updated.key,
      metaJson: { status: payload.status },
    });

    return updated;
  }

  health() {
    return { status: 'healthy', services: ['api', 'postgres', 'redis'] };
  }

  restartService(service: string) {
    return { service, restarted: true, mode: 'simulated' };
  }

  async aiUsage() {
    const grouped = await this.prisma.aiGenerationJob.groupBy({
      by: ['status'],
      _count: true,
    });
    return { grouped };
  }

  flags() {
    return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  async upsertFlag(
    key: string,
    enabled: boolean,
    description: string | undefined,
    actor: { id: string; role: Role },
  ) {
    const flag = await this.prisma.featureFlag.upsert({
      where: { key },
      create: { key, enabled, description },
      update: { enabled, description },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.flag.upsert',
      entityType: 'FeatureFlag',
      entityId: key,
      metaJson: { enabled },
    });

    return flag;
  }

  auditLogs() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  settings() {
    return this.prisma.platformSetting.findMany({ orderBy: { key: 'asc' } });
  }

  async upsertSetting(
    key: string,
    valueJson: Record<string, unknown>,
    actor: { id: string; role: Role },
  ) {
    const setting = await this.prisma.platformSetting.upsert({
      where: { key },
      create: { key, valueJson: valueJson as Prisma.InputJsonValue },
      update: { valueJson: valueJson as Prisma.InputJsonValue },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.setting.upsert',
      entityType: 'PlatformSetting',
      entityId: key,
    });

    return setting;
  }

  async upsertSettingsBatch(
    values: Record<string, Record<string, unknown>>,
    actor: { id: string; role: Role },
  ) {
    const entries = Object.entries(values);
    const ops = entries.map(([key, valueJson]) =>
      this.prisma.platformSetting.upsert({
        where: { key },
        create: { key, valueJson: valueJson as Prisma.InputJsonValue },
        update: { valueJson: valueJson as Prisma.InputJsonValue },
      }),
    );

    const result = await this.prisma.$transaction(ops);

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.settings.batch_upsert',
      entityType: 'PlatformSetting',
      entityId: 'batch',
      metaJson: { keys: entries.map(([key]) => key) },
    });

    return { updated: result.length };
  }
}
