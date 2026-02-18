import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, StoreStatus } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

const SUPER_ROLES: Role[] = [
  Role.super_admin,
  Role.ops,
  Role.support,
  Role.finance,
];

@Injectable()
export class StoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    ownerId: string,
    data: { name: string; slug: string; themePreset?: string },
  ) {
    const store = await this.prisma.store.create({
      data: {
        ownerId,
        name: data.name,
        slug: data.slug,
        themePreset: data.themePreset,
      },
    });

    await this.auditService.log({
      actorUserId: ownerId,
      action: 'store.create',
      entityType: 'Store',
      entityId: store.id,
      metaJson: { slug: store.slug },
    });

    return store;
  }

  async list(user: { id: string; role: Role }) {
    if (SUPER_ROLES.includes(user.role)) {
      return this.prisma.store.findMany({ orderBy: { createdAt: 'desc' } });
    }

    return this.prisma.store.findMany({
      where: {
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.store.findUnique({
      where: { id },
      include: { trackingConfig: true, themeConfig: true },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      themePreset?: string;
      status?: StoreStatus;
    },
    actor: { id: string; role: Role },
  ) {
    const store = await this.prisma.store.update({ where: { id }, data });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.update',
      entityType: 'Store',
      entityId: id,
      metaJson: data as unknown as Record<string, unknown>,
    });
    return store;
  }

  async publish(id: string, actor: { id: string; role: Role }) {
    const store = await this.prisma.store.update({
      where: { id },
      data: { status: StoreStatus.active, publishedAt: new Date() },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.publish',
      entityType: 'Store',
      entityId: id,
    });

    return store;
  }

  async upsertTracking(
    storeId: string,
    data: { pixelId?: string; gtmId?: string; capiToken?: string },
    actor: { id: string; role: Role },
  ) {
    const config = await this.prisma.trackingConfig.upsert({
      where: { storeId },
      create: {
        storeId,
        pixelId: data.pixelId,
        gtmId: data.gtmId,
        capiToken: data.capiToken,
      },
      update: {
        pixelId: data.pixelId,
        gtmId: data.gtmId,
        capiToken: data.capiToken,
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.tracking.update',
      entityType: 'TrackingConfig',
      entityId: config.id,
      metaJson: { storeId },
    });

    return config;
  }

  async upsertTheme(
    storeId: string,
    data: { preset?: string; customJson?: Record<string, unknown> },
    actor: { id: string; role: Role },
  ) {
    const theme = await this.prisma.themeConfig.upsert({
      where: { storeId },
      create: {
        storeId,
        preset: data.preset,
        customJson: data.customJson as Prisma.InputJsonValue | undefined,
      },
      update: {
        preset: data.preset,
        customJson: data.customJson as Prisma.InputJsonValue | undefined,
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.theme.update',
      entityType: 'ThemeConfig',
      entityId: theme.id,
      metaJson: { storeId, preset: data.preset },
    });

    return theme;
  }

  async getMarketing(storeId: string) {
    const row = await this.prisma.platformSetting.findUnique({
      where: { key: `marketing:${storeId}` },
    });
    return row?.valueJson ?? {};
  }

  async upsertMarketing(
    storeId: string,
    data: Record<string, unknown>,
    actor: { id: string; role: Role },
  ) {
    const saved = await this.prisma.platformSetting.upsert({
      where: { key: `marketing:${storeId}` },
      create: {
        key: `marketing:${storeId}`,
        valueJson: data as Prisma.InputJsonValue,
      },
      update: { valueJson: data as Prisma.InputJsonValue },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.marketing.update',
      entityType: 'PlatformSetting',
      entityId: saved.key,
      metaJson: { storeId },
    });

    return saved;
  }

  async getContent(storeId: string) {
    const row = await this.prisma.platformSetting.findUnique({
      where: { key: `store_content:${storeId}` },
    });
    return row?.valueJson ?? {};
  }

  async upsertContent(
    storeId: string,
    data: Record<string, unknown>,
    actor: { id: string; role: Role },
  ) {
    const saved = await this.prisma.platformSetting.upsert({
      where: { key: `store_content:${storeId}` },
      create: {
        key: `store_content:${storeId}`,
        valueJson: data as Prisma.InputJsonValue,
      },
      update: { valueJson: data as Prisma.InputJsonValue },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.content.update',
      entityType: 'PlatformSetting',
      entityId: saved.key,
      metaJson: { storeId },
    });

    return saved;
  }

  async connectDomain(
    storeId: string,
    domain: string,
    actor: { id: string; role: Role },
  ) {
    const value = {
      domain,
      domainStatus: 'verifying',
      sslStatus: 'pending',
      connectedAt: new Date().toISOString(),
    };
    const saved = await this.prisma.platformSetting.upsert({
      where: { key: `domain:${storeId}` },
      create: {
        key: `domain:${storeId}`,
        valueJson: value as Prisma.InputJsonValue,
      },
      update: { valueJson: value as Prisma.InputJsonValue },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.domain.connect',
      entityType: 'PlatformSetting',
      entityId: saved.key,
      metaJson: { storeId, domain },
    });
    return saved;
  }

  async verifyDomain(storeId: string, actor: { id: string; role: Role }) {
    const existing = await this.prisma.platformSetting.findUnique({
      where: { key: `domain:${storeId}` },
    });
    const current =
      (existing?.valueJson as Record<string, unknown> | undefined) ?? {};
    const next = {
      ...current,
      domainStatus: 'connected',
      verifiedAt: new Date().toISOString(),
    };
    const saved = await this.prisma.platformSetting.upsert({
      where: { key: `domain:${storeId}` },
      create: {
        key: `domain:${storeId}`,
        valueJson: next as Prisma.InputJsonValue,
      },
      update: { valueJson: next as Prisma.InputJsonValue },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.domain.verify',
      entityType: 'PlatformSetting',
      entityId: saved.key,
      metaJson: { storeId },
    });
    return saved;
  }

  async buyDomain(
    storeId: string,
    data: { domain: string; autoConnect?: boolean },
    actor: { id: string; role: Role },
  ) {
    const value = {
      domain: data.domain,
      purchased: true,
      purchasedAt: new Date().toISOString(),
      domainStatus: data.autoConnect ? 'verifying' : 'not_connected',
      sslStatus: 'pending',
    };
    const saved = await this.prisma.platformSetting.upsert({
      where: { key: `domain:${storeId}` },
      create: {
        key: `domain:${storeId}`,
        valueJson: value as Prisma.InputJsonValue,
      },
      update: { valueJson: value as Prisma.InputJsonValue },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.domain.buy',
      entityType: 'PlatformSetting',
      entityId: saved.key,
      metaJson: {
        storeId,
        domain: data.domain,
        autoConnect: data.autoConnect ?? false,
      },
    });
    return saved;
  }

  async refreshSsl(storeId: string, actor: { id: string; role: Role }) {
    const existing = await this.prisma.platformSetting.findUnique({
      where: { key: `domain:${storeId}` },
    });
    const current =
      (existing?.valueJson as Record<string, unknown> | undefined) ?? {};
    const next = {
      ...current,
      sslStatus: 'active',
      sslRefreshedAt: new Date().toISOString(),
    };
    const saved = await this.prisma.platformSetting.upsert({
      where: { key: `domain:${storeId}` },
      create: {
        key: `domain:${storeId}`,
        valueJson: next as Prisma.InputJsonValue,
      },
      update: { valueJson: next as Prisma.InputJsonValue },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'store.ssl.refresh',
      entityType: 'PlatformSetting',
      entityId: saved.key,
      metaJson: { storeId },
    });
    return saved;
  }

  async assertStoreAccess(storeId: string, user: { id: string; role: Role }) {
    if (SUPER_ROLES.includes(user.role)) return;

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) throw new NotFoundException('Store not found');

    if (store.ownerId === user.id) return;

    const member = await this.prisma.storeMember.findUnique({
      where: { storeId_userId: { storeId, userId: user.id } },
    });

    if (!member) throw new ForbiddenException('No access to this store');
  }
}
