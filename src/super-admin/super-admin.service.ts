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

  async overviewMetrics(from?: string, to?: string) {
    const createdAt =
      from || to
        ? {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          }
        : undefined;

    const where = createdAt ? { createdAt } : undefined;
    const [totalRevenue, totalOrders, activeStores, failedPayments] =
      await Promise.all([
        this.prisma.order.aggregate({ where, _sum: { total: true } }),
        this.prisma.order.count({ where }),
        this.prisma.store.count({ where: { status: StoreStatus.active } }),
        this.prisma.paymentTransaction.count({
          where: {
            ...(createdAt ? { createdAt } : {}),
            status: { in: ['failed', 'cancelled'] },
          },
        }),
      ]);

    return {
      from: from ?? null,
      to: to ?? null,
      totalRevenue: totalRevenue._sum.total ?? 0,
      totalOrders,
      activeStores,
      failedPayments,
    };
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

  async updateAdminStatus(
    id: string,
    isActive: boolean,
    actor: { id: string; role: Role },
  ) {
    const admin = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.admin.status',
      entityType: 'User',
      entityId: id,
      metaJson: { isActive },
    });

    return admin;
  }

  async resetAdminPassword(id: string, actor: { id: string; role: Role }) {
    const token = `reset-${Date.now().toString(36)}`;
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.admin.reset_password',
      entityType: 'User',
      entityId: id,
    });
    return { id, resetToken: token, simulated: true };
  }

  async resendAdminInvite(id: string, actor: { id: string; role: Role }) {
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.admin.resend_invite',
      entityType: 'User',
      entityId: id,
    });
    return { id, resent: true, simulated: true };
  }

  async subscriptions() {
    const stores = await this.prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true },
    });
    const settings = await this.prisma.platformSetting.findMany({
      where: { key: { startsWith: 'subscription:' } },
    });
    const map = new Map(
      settings.map((s) => [s.key.replace('subscription:', ''), s.valueJson]),
    );

    return stores.map((store) => ({
      storeId: store.id,
      storeName: store.name,
      subscription: (map.get(store.id) as
        | Record<string, unknown>
        | undefined) ?? {
        plan: 'starter',
        status: 'trial',
        nextBillingDate: null,
        expiryDate: null,
      },
      createdAt: store.createdAt,
    }));
  }

  async subscriptionByStore(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    const setting = await this.prisma.platformSetting.findUnique({
      where: { key: `subscription:${storeId}` },
    });

    return {
      storeId,
      storeName: store.name,
      subscription: (setting?.valueJson as
        | Record<string, unknown>
        | undefined) ?? {
        plan: 'starter',
        status: 'trial',
      },
    };
  }

  async updateSubscription(
    storeId: string,
    payload: {
      plan?: string;
      status?: 'active' | 'trial' | 'past_due' | 'cancelled';
      nextBillingDate?: string;
      expiryDate?: string;
    },
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.platformSetting.findUnique({
      where: { key: `subscription:${storeId}` },
    });
    const current =
      (existing?.valueJson as Record<string, unknown> | undefined) ?? {};
    const next = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    const saved = await this.prisma.platformSetting.upsert({
      where: { key: `subscription:${storeId}` },
      create: {
        key: `subscription:${storeId}`,
        valueJson: next as Prisma.InputJsonValue,
      },
      update: { valueJson: next as Prisma.InputJsonValue },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.subscription.update',
      entityType: 'PlatformSetting',
      entityId: saved.key,
      metaJson: { storeId },
    });

    return saved;
  }

  async retrySubscription(storeId: string, actor: { id: string; role: Role }) {
    const result = await this.updateSubscription(
      storeId,
      {
        status: 'active',
        nextBillingDate: new Date(Date.now() + 86_400_000 * 30).toISOString(),
      },
      actor,
    );
    return { retried: true, storeId, result };
  }

  async cancelSubscription(storeId: string, actor: { id: string; role: Role }) {
    const result = await this.updateSubscription(
      storeId,
      { status: 'cancelled' },
      actor,
    );
    return { cancelled: true, storeId, result };
  }

  async paymentOps() {
    const rows = await this.prisma.platformSetting.findMany({
      where: { key: { startsWith: 'payment_ops:' } },
      orderBy: { key: 'asc' },
    });
    return rows.map((row) => ({
      storeId: row.key.replace('payment_ops:', ''),
      ...(row.valueJson as Record<string, unknown>),
    }));
  }

  async paymentOpsMetrics() {
    const [total, failed, succeeded] = await Promise.all([
      this.prisma.paymentTransaction.count(),
      this.prisma.paymentTransaction.count({
        where: { status: { in: ['failed', 'cancelled'] } },
      }),
      this.prisma.paymentTransaction.count({
        where: { status: { in: ['succeeded', 'paid'] } },
      }),
    ]);
    const successRate = total
      ? Number(((succeeded / total) * 100).toFixed(2))
      : 0;
    return {
      totalTransactions: total,
      failedTransactions: failed,
      successRatePct: successRate,
    };
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
    rolloutPct: number | undefined,
    actor: { id: string; role: Role },
  ) {
    const flag = await this.prisma.featureFlag.upsert({
      where: { key },
      create: { key, enabled, description, rolloutPct: rolloutPct ?? 100 },
      update: {
        enabled,
        description,
        ...(rolloutPct !== undefined ? { rolloutPct } : {}),
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'super_admin.flag.upsert',
      entityType: 'FeatureFlag',
      entityId: key,
      metaJson: { enabled, rolloutPct: rolloutPct ?? flag.rolloutPct },
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
