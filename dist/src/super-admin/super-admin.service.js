"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
const PLAN_PRICE_USD = {
    Starter: 39,
    Growth: 129,
    Scale: 299,
};
const MAINTENANCE_MODE_KEY = 'super_admin:maintenance_mode';
const PLATFORM_KEYS_KEY = 'super_admin:platform_keys';
const AI_BUDGET_KEY = 'super_admin:ai_budget';
const PLAN_SETTINGS_KEY = 'super_admin:plan_settings';
let SuperAdminService = class SuperAdminService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async overview() {
        const [stores, users, orders, aiJobs] = await Promise.all([
            this.prisma.store.count(),
            this.prisma.user.count(),
            this.prisma.order.count(),
            this.prisma.aiGenerationJob.count(),
        ]);
        return { stores, users, orders, aiJobs };
    }
    async overviewMetrics(from, to) {
        const createdAt = from || to
            ? {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
            }
            : undefined;
        const where = createdAt ? { createdAt } : undefined;
        const [totalRevenue, totalOrders, activeStores, failedPayments] = await Promise.all([
            this.prisma.order.aggregate({ where, _sum: { total: true } }),
            this.prisma.order.count({ where }),
            this.prisma.store.count({ where: { status: client_1.StoreStatus.active } }),
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
    async stores() {
        const [stores, revenueRows, subscriptionRows, profileRows] = await Promise.all([
            this.prisma.store.findMany({
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    createdAt: true,
                    owner: { select: { email: true } },
                },
            }),
            this.prisma.order.groupBy({
                by: ['storeId'],
                _sum: { total: true },
            }),
            this.prisma.platformSetting.findMany({
                where: { key: { startsWith: 'subscription:' } },
            }),
            this.prisma.platformSetting.findMany({
                where: { key: { startsWith: 'store_profile:' } },
            }),
        ]);
        const revenueMap = new Map(revenueRows.map((row) => [row.storeId, Number(row._sum.total ?? 0)]));
        const subscriptionMap = new Map(subscriptionRows.map((row) => [
            row.key.replace('subscription:', ''),
            this.asRecord(row.valueJson),
        ]));
        const profileMap = new Map(profileRows.map((row) => [
            row.key.replace('store_profile:', ''),
            this.asRecord(row.valueJson),
        ]));
        return stores.map((store) => {
            const subscription = subscriptionMap.get(store.id) ?? {};
            const profile = profileMap.get(store.id) ?? {};
            const subscriptionStatus = this.normalizeSubscriptionStatus(subscription.status);
            return {
                id: store.id,
                name: store.name,
                ownerEmail: this.asString(profile.ownerEmail, '') ||
                    store.owner.email ||
                    'unknown@store.local',
                plan: this.normalizePlan(subscription.plan),
                region: this.asString(profile.region, 'US-East'),
                gmvUsd: revenueMap.get(store.id) ?? 0,
                status: this.toDashboardStoreStatus(store.status, subscriptionStatus),
                createdAt: store.createdAt,
            };
        });
    }
    async createStore(data, actor) {
        const name = data.name.trim();
        const ownerEmail = data.ownerEmail.trim().toLowerCase();
        if (!name)
            throw new common_1.BadRequestException('Store name is required');
        if (!ownerEmail)
            throw new common_1.BadRequestException('ownerEmail is required');
        let owner = await this.prisma.user.findUnique({ where: { email: ownerEmail } });
        if (!owner) {
            owner = await this.prisma.user.create({
                data: {
                    name,
                    email: ownerEmail,
                    passwordHash: 'invite-pending',
                    role: client_1.Role.owner,
                },
            });
        }
        const slug = await this.generateUniqueSlug(name);
        const desiredStatus = data.status ?? 'active';
        const storeStatus = this.dashboardStatusToStoreStatus(desiredStatus);
        const store = await this.prisma.store.create({
            data: {
                ownerId: owner.id,
                name,
                slug,
                status: storeStatus,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        });
        const plan = this.normalizePlan(data.plan);
        const subscriptionStatus = desiredStatus === 'trial'
            ? 'trial'
            : desiredStatus === 'suspended'
                ? 'cancelled'
                : 'active';
        await this.prisma.platformSetting.upsert({
            where: { key: `subscription:${store.id}` },
            create: {
                key: `subscription:${store.id}`,
                valueJson: {
                    plan,
                    status: subscriptionStatus,
                    amountUsd: subscriptionStatus === 'active' ? PLAN_PRICE_USD[plan] : 0,
                    failedPaymentCount: 0,
                },
            },
            update: {
                valueJson: {
                    plan,
                    status: subscriptionStatus,
                    amountUsd: subscriptionStatus === 'active' ? PLAN_PRICE_USD[plan] : 0,
                    failedPaymentCount: 0,
                },
            },
        });
        await this.prisma.platformSetting.upsert({
            where: { key: `store_profile:${store.id}` },
            create: {
                key: `store_profile:${store.id}`,
                valueJson: {
                    ownerEmail,
                    region: data.region?.trim() || 'US-East',
                },
            },
            update: {
                valueJson: {
                    ownerEmail,
                    region: data.region?.trim() || 'US-East',
                },
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.store.create',
            entityType: 'Store',
            entityId: store.id,
            metaJson: { ownerEmail, plan, status: desiredStatus },
        });
        return {
            id: store.id,
            name: store.name,
            ownerEmail,
            plan,
            region: data.region?.trim() || 'US-East',
            gmvUsd: 0,
            status: desiredStatus,
            createdAt: store.createdAt,
        };
    }
    async updateStoreStatus(id, status, actor) {
        const store = await this.prisma.store.update({
            where: { id },
            data: { status },
            select: {
                id: true,
                name: true,
                status: true,
                createdAt: true,
                owner: { select: { email: true } },
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.store.status',
            entityType: 'Store',
            entityId: id,
            metaJson: { status },
        });
        return {
            id: store.id,
            name: store.name,
            ownerEmail: store.owner.email,
            status: this.toDashboardStoreStatus(store.status),
            createdAt: store.createdAt,
        };
    }
    async deleteStore(id, actor) {
        const store = await this.prisma.store.findUnique({
            where: { id },
            select: { id: true, name: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        await this.prisma.$transaction(async (tx) => {
            await tx.platformSetting.deleteMany({
                where: {
                    OR: [
                        { key: { startsWith: `subscription:${id}` } },
                        { key: { startsWith: `payment_ops:${id}` } },
                        { key: { startsWith: `lifecycle:${id}` } },
                        { key: { startsWith: `domain:${id}` } },
                        { key: { startsWith: `marketing:${id}` } },
                        { key: { startsWith: `store_content:${id}` } },
                        { key: { startsWith: `store_profile:${id}` } },
                        { key: { startsWith: `shipping_config:${id}` } },
                        { key: { startsWith: `payment_config:${id}` } },
                        { key: { startsWith: `ai_prompt:${id}:` } },
                    ],
                },
            });
            await tx.store.delete({ where: { id } });
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.store.delete',
            entityType: 'Store',
            entityId: id,
            metaJson: { name: store.name },
        });
        return { deleted: true, id, name: store.name };
    }
    async lifecycle() {
        const [stores, lifecycleRows, domainRows] = await Promise.all([
            this.prisma.store.findMany({
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    updatedAt: true,
                    publishedAt: true,
                    themeConfig: { select: { updatedAt: true } },
                },
            }),
            this.prisma.platformSetting.findMany({
                where: { key: { startsWith: 'lifecycle:' } },
            }),
            this.prisma.platformSetting.findMany({
                where: { key: { startsWith: 'domain:' } },
            }),
        ]);
        const lifecycleMap = new Map(lifecycleRows.map((row) => [
            row.key.replace('lifecycle:', ''),
            this.asRecord(row.valueJson),
        ]));
        const domainMap = new Map(domainRows.map((row) => [
            row.key.replace('domain:', ''),
            this.asRecord(row.valueJson),
        ]));
        return stores.map((store) => {
            const lifecycle = lifecycleMap.get(store.id) ?? {};
            const domain = domainMap.get(store.id) ?? {};
            const forcedThemeUpdateAt = this.asString(lifecycle.lastThemeUpdateAt, '');
            return {
                storeId: store.id,
                storeName: store.name,
                publishStatus: this.asString(lifecycle.publishStatus, store.status === client_1.StoreStatus.active ? 'published' : 'draft'),
                domain: this.asString(lifecycle.domain, this.asString(domain.domain, 'N/A')),
                domainStatus: this.asString(lifecycle.domainStatus, this.asString(domain.domainStatus, 'not_connected')),
                sslStatus: this.asString(lifecycle.sslStatus, this.asString(domain.sslStatus, 'inactive')),
                lastPublishedAt: store.publishedAt
                    ? store.publishedAt.toISOString()
                    : 'N/A',
                lastThemeUpdateAt: forcedThemeUpdateAt ||
                    (store.themeConfig?.updatedAt ?? store.updatedAt).toISOString(),
            };
        });
    }
    async lifecycleByStore(storeId) {
        const rows = await this.lifecycle();
        const row = rows.find((item) => item.storeId === storeId);
        if (!row)
            throw new common_1.NotFoundException('Store not found');
        return row;
    }
    async updateLifecycle(storeId, payload, actor) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
        });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        const existing = await this.prisma.platformSetting.findUnique({
            where: { key: `lifecycle:${storeId}` },
        });
        const current = this.asRecord(existing?.valueJson);
        const patch = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
        const next = {
            ...current,
            ...patch,
            updatedAt: new Date().toISOString(),
        };
        const updated = await this.prisma.platformSetting.upsert({
            where: { key: `lifecycle:${storeId}` },
            create: {
                key: `lifecycle:${storeId}`,
                valueJson: next,
            },
            update: { valueJson: next },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.lifecycle.update',
            entityType: 'PlatformSetting',
            entityId: updated.key,
            metaJson: { storeId },
        });
        return this.lifecycleByStore(storeId);
    }
    async markThemeSynced(storeId, at, actor) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
            select: { id: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        const now = new Date();
        const nextAt = at ? new Date(at) : now;
        if (Number.isNaN(nextAt.getTime())) {
            throw new common_1.BadRequestException('Invalid theme sync timestamp');
        }
        const existing = await this.prisma.platformSetting.findUnique({
            where: { key: `lifecycle:${storeId}` },
        });
        const current = this.asRecord(existing?.valueJson);
        const next = {
            ...current,
            lastThemeUpdateAt: nextAt.toISOString(),
            updatedAt: now.toISOString(),
        };
        await this.prisma.platformSetting.upsert({
            where: { key: `lifecycle:${storeId}` },
            create: {
                key: `lifecycle:${storeId}`,
                valueJson: next,
            },
            update: { valueJson: next },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.lifecycle.theme_sync',
            entityType: 'PlatformSetting',
            entityId: `lifecycle:${storeId}`,
            metaJson: { storeId, at: nextAt.toISOString() },
        });
        return this.lifecycleByStore(storeId);
    }
    async admins() {
        const rows = await this.prisma.user.findMany({
            where: {
                role: { in: [client_1.Role.super_admin, client_1.Role.ops, client_1.Role.support, client_1.Role.finance] },
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                passwordHash: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            status: this.toAdminStatus(row.isActive, row.passwordHash),
            lastActive: row.updatedAt.toISOString(),
        }));
    }
    async inviteAdmin(data, actor) {
        const email = data.email.trim().toLowerCase();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.ConflictException('Admin email already exists');
        }
        const admin = await this.prisma.user.create({
            data: {
                name: data.name,
                email,
                passwordHash: 'invite-pending',
                role: data.role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                passwordHash: true,
                updatedAt: true,
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.admin.invite',
            entityType: 'User',
            entityId: admin.id,
            metaJson: { invitedRole: data.role },
        });
        return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            status: this.toAdminStatus(admin.isActive, admin.passwordHash),
            lastActive: admin.updatedAt.toISOString(),
        };
    }
    async updateAdminStatus(id, isActive, actor) {
        const admin = await this.prisma.user.update({
            where: { id },
            data: { isActive },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                passwordHash: true,
                updatedAt: true,
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.admin.status',
            entityType: 'User',
            entityId: id,
            metaJson: { isActive },
        });
        return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            status: this.toAdminStatus(admin.isActive, admin.passwordHash),
            lastActive: admin.updatedAt.toISOString(),
        };
    }
    async resetAdminPassword(id, actor) {
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
    async resendAdminInvite(id, actor) {
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
        const [stores, settings] = await Promise.all([
            this.prisma.store.findMany({
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    createdAt: true,
                    owner: { select: { email: true } },
                },
            }),
            this.prisma.platformSetting.findMany({
                where: { key: { startsWith: 'subscription:' } },
            }),
        ]);
        const map = new Map(settings.map((row) => [
            row.key.replace('subscription:', ''),
            this.asRecord(row.valueJson),
        ]));
        return stores.map((store) => this.toSubscriptionRecord(store.id, store.name, store.owner.email, store.status, map.get(store.id)));
    }
    async subscriptionByStore(storeId) {
        const [store, setting] = await Promise.all([
            this.prisma.store.findUnique({
                where: { id: storeId },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    owner: { select: { email: true } },
                },
            }),
            this.prisma.platformSetting.findUnique({
                where: { key: `subscription:${storeId}` },
            }),
        ]);
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return this.toSubscriptionRecord(store.id, store.name, store.owner.email, store.status, setting ? this.asRecord(setting.valueJson) : undefined);
    }
    async updateSubscription(storeId, payload, actor) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
            select: { id: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        const existing = await this.prisma.platformSetting.findUnique({
            where: { key: `subscription:${storeId}` },
        });
        const current = this.asRecord(existing?.valueJson);
        const plan = payload.plan
            ? this.normalizePlan(payload.plan)
            : this.normalizePlan(current.plan);
        const status = payload.status
            ? this.normalizeSubscriptionStatus(payload.status)
            : this.normalizeSubscriptionStatus(current.status);
        const next = {
            ...current,
            ...payload,
            plan,
            status,
            amountUsd: this.asNumber(current.amountUsd, status === 'active' ? PLAN_PRICE_USD[plan] : 0),
            updatedAt: new Date().toISOString(),
        };
        await this.prisma.platformSetting.upsert({
            where: { key: `subscription:${storeId}` },
            create: {
                key: `subscription:${storeId}`,
                valueJson: next,
            },
            update: { valueJson: next },
        });
        await this.prisma.store.update({
            where: { id: storeId },
            data: { status: this.subscriptionToStoreStatus(status) },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.subscription.update',
            entityType: 'PlatformSetting',
            entityId: `subscription:${storeId}`,
            metaJson: { storeId },
        });
        return this.subscriptionByStore(storeId);
    }
    async retrySubscription(storeId, actor) {
        const result = await this.updateSubscription(storeId, {
            status: 'active',
            nextBillingDate: new Date(Date.now() + 86_400_000 * 30).toISOString(),
        }, actor);
        return { retried: true, storeId, result };
    }
    async cancelSubscription(storeId, actor) {
        const result = await this.updateSubscription(storeId, { status: 'cancelled' }, actor);
        return { cancelled: true, storeId, result };
    }
    async syncSubscriptionPricing(actor) {
        const [planSettings, subscriptionRows] = await Promise.all([
            this.prisma.platformSetting.findUnique({
                where: { key: PLAN_SETTINGS_KEY },
            }),
            this.prisma.platformSetting.findMany({
                where: { key: { startsWith: 'subscription:' } },
            }),
        ]);
        const settings = this.asRecord(planSettings?.valueJson);
        const prices = {
            Starter: Math.max(0, this.asNumber(settings.starterPrice, PLAN_PRICE_USD.Starter)),
            Growth: Math.max(0, this.asNumber(settings.growthPrice, PLAN_PRICE_USD.Growth)),
            Scale: Math.max(0, this.asNumber(settings.scalePrice, PLAN_PRICE_USD.Scale)),
        };
        const now = new Date().toISOString();
        const updates = [];
        let updated = 0;
        let skipped = 0;
        for (const row of subscriptionRows) {
            const current = this.asRecord(row.valueJson);
            const status = this.normalizeSubscriptionStatus(current.status);
            if (status !== 'active') {
                skipped += 1;
                continue;
            }
            const plan = this.normalizePlan(current.plan);
            const nextAmount = prices[plan];
            const currentAmount = this.asNumber(current.amountUsd, nextAmount);
            if (Math.abs(currentAmount - nextAmount) < 0.0001) {
                skipped += 1;
                continue;
            }
            const next = {
                ...current,
                amountUsd: nextAmount,
                syncedFromPlanSettingsAt: now,
                updatedAt: now,
            };
            updates.push(this.prisma.platformSetting.update({
                where: { key: row.key },
                data: { valueJson: next },
            }));
            updated += 1;
        }
        if (updates.length) {
            await this.prisma.$transaction(updates);
        }
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.subscription.sync_pricing',
            entityType: 'PlatformSetting',
            entityId: 'subscription:*',
            metaJson: { updated, skipped, prices },
        });
        return { updated, skipped, prices };
    }
    async paymentOps() {
        const since = new Date(Date.now() - 86_400_000);
        const [stores, configRows, txRows] = await Promise.all([
            this.prisma.store.findMany({
                orderBy: { createdAt: 'desc' },
                select: { id: true, name: true },
            }),
            this.prisma.platformSetting.findMany({
                where: { key: { startsWith: 'payment_ops:' } },
            }),
            this.prisma.paymentTransaction.groupBy({
                by: ['storeId', 'status'],
                where: { createdAt: { gte: since } },
                _count: { _all: true },
            }),
        ]);
        const configMap = new Map(configRows.map((row) => [
            row.key.replace('payment_ops:', ''),
            this.asRecord(row.valueJson),
        ]));
        const metricMap = new Map();
        for (const row of txRows) {
            const current = metricMap.get(row.storeId) ?? {
                total: 0,
                failed: 0,
                succeeded: 0,
            };
            current.total += row._count._all;
            if (row.status === 'failed' || row.status === 'cancelled') {
                current.failed += row._count._all;
            }
            if (row.status === 'succeeded' || row.status === 'paid') {
                current.succeeded += row._count._all;
            }
            metricMap.set(row.storeId, current);
        }
        return stores.map((store) => {
            const config = configMap.get(store.id) ?? {};
            const metric = metricMap.get(store.id) ?? {
                total: 0,
                failed: 0,
                succeeded: 0,
            };
            const computedSuccessRate = metric.total
                ? Number(((metric.succeeded / metric.total) * 100).toFixed(2))
                : 0;
            const manualFailed = this.asNumber(config.manualFailedCheckout24h, Number.NaN);
            const manualSuccessRate = this.asNumber(config.manualCheckoutSuccessRatePct, Number.NaN);
            const failedCheckout24h = Number.isFinite(manualFailed)
                ? Math.max(0, Math.round(manualFailed))
                : metric.failed;
            const checkoutSuccessRatePct = Number.isFinite(manualSuccessRate)
                ? Math.max(0, Math.min(100, manualSuccessRate))
                : computedSuccessRate;
            return {
                storeId: store.id,
                storeName: store.name,
                stripeEnabled: this.asBoolean(config.stripeEnabled, true),
                stripeMode: this.normalizeMode(config.stripeMode ?? config.mode),
                sslCommerzEnabled: this.asBoolean(config.sslCommerzEnabled, false),
                sslCommerzMode: this.normalizeMode(config.sslCommerzMode ?? config.mode),
                codEnabled: this.asBoolean(config.codEnabled, true),
                failedCheckout24h,
                checkoutSuccessRatePct,
            };
        });
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
    async paymentOpsByStore(storeId) {
        const [store, rows] = await Promise.all([
            this.prisma.store.findUnique({
                where: { id: storeId },
                select: { id: true, name: true },
            }),
            this.paymentOps(),
        ]);
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return (rows.find((row) => row.storeId === storeId) ?? {
            storeId: store.id,
            storeName: store.name,
            stripeEnabled: true,
            stripeMode: 'test',
            sslCommerzEnabled: false,
            sslCommerzMode: 'test',
            codEnabled: true,
            failedCheckout24h: 0,
            checkoutSuccessRatePct: 0,
        });
    }
    async updatePaymentOps(storeId, payload, actor) {
        const existing = await this.prisma.platformSetting.findUnique({
            where: { key: `payment_ops:${storeId}` },
        });
        const current = this.asRecord(existing?.valueJson);
        const next = {
            ...current,
            ...payload,
            ...(payload.mode
                ? { stripeMode: payload.mode, sslCommerzMode: payload.mode }
                : {}),
            updatedAt: new Date().toISOString(),
        };
        const updated = await this.prisma.platformSetting.upsert({
            where: { key: `payment_ops:${storeId}` },
            create: {
                key: `payment_ops:${storeId}`,
                valueJson: next,
            },
            update: { valueJson: next },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.payment_ops.update',
            entityType: 'PlatformSetting',
            entityId: updated.key,
            metaJson: { storeId },
        });
        return this.paymentOpsByStore(storeId);
    }
    async resetPaymentFailures(storeId, actor) {
        const [existing, current] = await Promise.all([
            this.prisma.platformSetting.findUnique({
                where: { key: `payment_ops:${storeId}` },
            }),
            this.paymentOpsByStore(storeId),
        ]);
        const base = this.asRecord(existing?.valueJson);
        const next = {
            ...base,
            manualFailedCheckout24h: 0,
            manualCheckoutSuccessRatePct: Math.max(current.checkoutSuccessRatePct, 98),
            failureCounterResetAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await this.prisma.platformSetting.upsert({
            where: { key: `payment_ops:${storeId}` },
            create: {
                key: `payment_ops:${storeId}`,
                valueJson: next,
            },
            update: { valueJson: next },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.payment_ops.reset_failures',
            entityType: 'PlatformSetting',
            entityId: `payment_ops:${storeId}`,
            metaJson: { storeId },
        });
        return this.paymentOpsByStore(storeId);
    }
    async tickets() {
        const rows = await this.prisma.platformSetting.findMany({
            where: { key: { startsWith: 'ticket:' } },
            orderBy: { updatedAt: 'desc' },
        });
        return rows.map((row) => this.toTicketRecord(row.key, this.asRecord(row.valueJson), row.updatedAt));
    }
    async ticket(id) {
        const row = await this.prisma.platformSetting.findUnique({
            where: { key: `ticket:${id}` },
        });
        if (!row) {
            return {
                id,
                storeName: 'Unknown Store',
                category: 'bug',
                priority: 'medium',
                status: 'open',
                slaHours: 24,
                createdAt: new Date().toISOString(),
                note: 'Ticket details placeholder',
            };
        }
        return this.toTicketRecord(row.key, this.asRecord(row.valueJson), row.updatedAt);
    }
    async updateTicket(id, payload, actor) {
        const existing = await this.prisma.platformSetting.findUnique({
            where: { key: `ticket:${id}` },
        });
        const current = this.asRecord(existing?.valueJson);
        const next = {
            ...current,
            ...payload,
            updatedAt: new Date().toISOString(),
        };
        const updated = await this.prisma.platformSetting.upsert({
            where: { key: `ticket:${id}` },
            create: {
                key: `ticket:${id}`,
                valueJson: next,
            },
            update: { valueJson: next },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.ticket.update',
            entityType: 'PlatformSetting',
            entityId: updated.key,
            metaJson: { status: payload.status },
        });
        return this.ticket(id);
    }
    async securityIncidents() {
        const rows = await this.prisma.platformSetting.findMany({
            where: { key: { startsWith: 'incident:' } },
            orderBy: { updatedAt: 'desc' },
            take: 200,
        });
        return rows.map((row) => this.toIncidentRecord(row.key, this.asRecord(row.valueJson), row.updatedAt));
    }
    async createSecurityIncident(payload, actor) {
        const title = payload.title.trim();
        if (!title) {
            throw new common_1.BadRequestException('Incident title is required');
        }
        const incidentId = `INC-${Date.now().toString(36).toUpperCase()}`;
        const key = `incident:${incidentId}`;
        const now = new Date().toISOString();
        const status = payload.status
            ? this.normalizeIncidentStatus(payload.status)
            : 'monitoring';
        const startedAt = this.asString(payload.startedAt, now);
        const resolutionNote = this.asString(payload.resolutionNote, this.asString(payload.note, ''));
        const created = await this.prisma.platformSetting.create({
            data: {
                key,
                valueJson: {
                    id: incidentId,
                    title,
                    level: this.normalizeIncidentLevel(payload.level),
                    status,
                    startedAt,
                    note: payload.note ?? '',
                    resolutionNote: status === 'resolved'
                        ? resolutionNote || this.asString(payload.note, '')
                        : '',
                    createdAt: now,
                    createdBy: actor.id,
                    resolvedAt: status === 'resolved' ? now : null,
                },
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.security.incident.create',
            entityType: 'PlatformSetting',
            entityId: key,
            metaJson: { incidentId, level: payload.level, status },
        });
        return this.toIncidentRecord(created.key, this.asRecord(created.valueJson), created.updatedAt);
    }
    async updateSecurityIncident(id, payload, actor) {
        const key = `incident:${id}`;
        const existing = await this.prisma.platformSetting.findUnique({
            where: { key },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Incident not found');
        }
        const current = this.asRecord(existing.valueJson);
        const nextStatus = payload.status
            ? this.normalizeIncidentStatus(payload.status)
            : this.normalizeIncidentStatus(current.status);
        const now = new Date().toISOString();
        const next = {
            ...current,
            ...(payload.title !== undefined
                ? { title: this.asString(payload.title, this.asString(current.title, '')) }
                : {}),
            ...(payload.level !== undefined
                ? { level: this.normalizeIncidentLevel(payload.level) }
                : {}),
            ...(payload.note !== undefined ? { note: payload.note } : {}),
            ...(payload.resolutionNote !== undefined
                ? { resolutionNote: payload.resolutionNote }
                : {}),
            status: nextStatus,
            updatedAt: now,
            updatedBy: actor.id,
            resolvedAt: nextStatus === 'resolved'
                ? this.asString(current.resolvedAt, now)
                : null,
            resolutionNote: nextStatus === 'resolved'
                ? this.asString(payload.resolutionNote, this.asString(payload.note, this.asString(current.resolutionNote, '')))
                : this.asString(current.resolutionNote, ''),
        };
        const updated = await this.prisma.platformSetting.update({
            where: { key },
            data: { valueJson: next },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.security.incident.update',
            entityType: 'PlatformSetting',
            entityId: key,
            metaJson: {
                id,
                status: nextStatus,
                level: payload.level,
            },
        });
        return this.toIncidentRecord(updated.key, this.asRecord(updated.valueJson), updated.updatedAt);
    }
    async securityIncident(id) {
        const key = `incident:${id}`;
        const row = await this.prisma.platformSetting.findUnique({ where: { key } });
        if (!row)
            throw new common_1.NotFoundException('Incident not found');
        return this.toIncidentRecord(key, this.asRecord(row.valueJson), row.updatedAt);
    }
    async health() {
        const maintenanceSetting = await this.prisma.platformSetting.findUnique({
            where: { key: MAINTENANCE_MODE_KEY },
        });
        const maintenance = this.asRecord(maintenanceSetting?.valueJson);
        return {
            status: 'healthy',
            maintenanceMode: this.asBoolean(maintenance.enabled, false),
            services: [
                {
                    name: 'Public API',
                    uptimePct: 99.98,
                    latencyMs: 112,
                    status: 'healthy',
                },
                {
                    name: 'Checkout Worker',
                    uptimePct: 99.41,
                    latencyMs: 185,
                    status: 'degraded',
                },
                {
                    name: 'Image CDN',
                    uptimePct: 99.92,
                    latencyMs: 74,
                    status: 'healthy',
                },
                {
                    name: 'Core Database',
                    uptimePct: 99.99,
                    latencyMs: 48,
                    status: 'healthy',
                },
            ],
            generatedAt: new Date().toISOString(),
        };
    }
    restartService(service) {
        return { service, restarted: true, mode: 'simulated' };
    }
    async setMaintenanceMode(enabled, actor) {
        const now = new Date().toISOString();
        await this.prisma.platformSetting.upsert({
            where: { key: MAINTENANCE_MODE_KEY },
            create: {
                key: MAINTENANCE_MODE_KEY,
                valueJson: {
                    enabled,
                    updatedAt: now,
                    updatedBy: actor.id,
                },
            },
            update: {
                valueJson: {
                    enabled,
                    updatedAt: now,
                    updatedBy: actor.id,
                },
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.health.maintenance',
            entityType: 'PlatformSetting',
            entityId: MAINTENANCE_MODE_KEY,
            metaJson: { enabled },
        });
        return {
            enabled,
            updatedAt: now,
        };
    }
    async aiUsage() {
        const [grouped, budgetSetting] = await Promise.all([
            this.prisma.aiGenerationJob.groupBy({
                by: ['status'],
                _count: true,
            }),
            this.prisma.platformSetting.findUnique({
                where: { key: AI_BUDGET_KEY },
            }),
        ]);
        const budget = this.asRecord(budgetSetting?.valueJson);
        const hardCapUsd = Math.max(1, this.asNumber(budget.hardCapUsd, 150));
        const totalRequests = grouped.reduce((sum, row) => sum + row._count, 0);
        const completed = grouped.find((row) => row.status === 'completed')?._count ?? 0;
        const failed = grouped.find((row) => row.status === 'failed')?._count ?? 0;
        const tokens = completed * 1200;
        const costUsd = Number(((tokens / 1_000_000) * 7).toFixed(2));
        return {
            models: [
                {
                    model: 'Gemini 1.5 Flash',
                    requests: totalRequests,
                    tokens,
                    costUsd,
                    quotaPct: Math.min(100, Math.round((totalRequests / 50_000) * 100)),
                },
            ],
            grouped,
            totals: {
                requests: totalRequests,
                completed,
                failed,
            },
            hardCapUsd,
            utilizationPct: Math.min(100, Math.round((costUsd / hardCapUsd) * 100)),
        };
    }
    async updateAiHardCap(hardCapUsd, actor) {
        const normalized = Math.max(1, Math.round(hardCapUsd));
        const now = new Date().toISOString();
        await this.prisma.platformSetting.upsert({
            where: { key: AI_BUDGET_KEY },
            create: {
                key: AI_BUDGET_KEY,
                valueJson: {
                    hardCapUsd: normalized,
                    updatedAt: now,
                    updatedBy: actor.id,
                },
            },
            update: {
                valueJson: {
                    hardCapUsd: normalized,
                    updatedAt: now,
                    updatedBy: actor.id,
                },
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.ai_budget.update',
            entityType: 'PlatformSetting',
            entityId: AI_BUDGET_KEY,
            metaJson: { hardCapUsd: normalized },
        });
        return {
            hardCapUsd: normalized,
            updatedAt: now,
        };
    }
    async rotatePlatformKeys(actor) {
        const existing = await this.prisma.platformSetting.findUnique({
            where: { key: PLATFORM_KEYS_KEY },
        });
        const current = this.asRecord(existing?.valueJson);
        const keyVersion = Math.max(1, this.asNumber(current.keyVersion, 0) + 1);
        const keyId = `pk-${Date.now().toString(36)}`;
        const rotatedAt = new Date().toISOString();
        await this.prisma.platformSetting.upsert({
            where: { key: PLATFORM_KEYS_KEY },
            create: {
                key: PLATFORM_KEYS_KEY,
                valueJson: {
                    keyVersion,
                    keyId,
                    rotatedAt,
                    rotatedBy: actor.id,
                },
            },
            update: {
                valueJson: {
                    keyVersion,
                    keyId,
                    rotatedAt,
                    rotatedBy: actor.id,
                },
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'super_admin.security.rotate_keys',
            entityType: 'PlatformSetting',
            entityId: PLATFORM_KEYS_KEY,
            metaJson: { keyVersion, keyId },
        });
        return {
            rotated: true,
            keyVersion,
            keyId,
            rotatedAt,
        };
    }
    flags() {
        return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
    }
    async upsertFlag(key, enabled, description, rolloutPct, actor) {
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
    async auditLogs(format) {
        const rows = await this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                actor: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (format === 'dashboard') {
            return rows.map((row) => ({
                id: row.id,
                actor: row.actor?.name || row.actor?.email || 'system',
                action: row.action,
                target: `${row.entityType}:${row.entityId}`,
                risk: this.riskFromAction(row.action),
                at: row.createdAt.toISOString(),
            }));
        }
        return rows;
    }
    settings() {
        return this.prisma.platformSetting.findMany({ orderBy: { key: 'asc' } });
    }
    async upsertSetting(key, valueJson, actor) {
        const setting = await this.prisma.platformSetting.upsert({
            where: { key },
            create: { key, valueJson: valueJson },
            update: { valueJson: valueJson },
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
    async upsertSettingsBatch(values, actor) {
        const entries = Object.entries(values);
        const ops = entries.map(([key, valueJson]) => this.prisma.platformSetting.upsert({
            where: { key },
            create: { key, valueJson: valueJson },
            update: { valueJson: valueJson },
        }));
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
    toSubscriptionRecord(storeId, storeName, ownerEmail, storeStatus, payload) {
        const data = payload ?? {};
        const plan = this.normalizePlan(data.plan);
        const fallbackStatus = storeStatus === client_1.StoreStatus.suspended ||
            storeStatus === client_1.StoreStatus.archived
            ? 'cancelled'
            : storeStatus === client_1.StoreStatus.draft
                ? 'trial'
                : 'active';
        const status = this.normalizeSubscriptionStatus(data.status ?? fallbackStatus);
        const amountDefault = status === 'active' ? PLAN_PRICE_USD[plan] : 0;
        return {
            id: this.asString(data.id, '') || `SUB-${storeId.slice(-6).toUpperCase()}`,
            storeId,
            storeName,
            ownerEmail,
            plan,
            status,
            amountUsd: this.asNumber(data.amountUsd, amountDefault),
            nextBillingDate: this.asString(data.nextBillingDate, 'N/A'),
            expiryDate: this.asString(data.expiryDate, 'N/A'),
            lastPaymentDate: this.asString(data.lastPaymentDate, 'N/A'),
            failedPaymentCount: this.asNumber(data.failedPaymentCount, 0),
        };
    }
    toDashboardStoreStatus(status, subscriptionStatus) {
        if (subscriptionStatus === 'trial')
            return 'trial';
        if (status === client_1.StoreStatus.suspended ||
            status === client_1.StoreStatus.archived ||
            subscriptionStatus === 'cancelled') {
            return 'suspended';
        }
        if (status === client_1.StoreStatus.draft)
            return 'trial';
        return 'active';
    }
    dashboardStatusToStoreStatus(status) {
        if (status === 'trial')
            return client_1.StoreStatus.draft;
        if (status === 'suspended')
            return client_1.StoreStatus.suspended;
        return client_1.StoreStatus.active;
    }
    subscriptionToStoreStatus(status) {
        if (status === 'trial')
            return client_1.StoreStatus.draft;
        if (status === 'cancelled')
            return client_1.StoreStatus.suspended;
        return client_1.StoreStatus.active;
    }
    normalizePlan(value) {
        const raw = String(value ?? '').trim().toLowerCase();
        if (raw === 'growth')
            return 'Growth';
        if (raw === 'scale')
            return 'Scale';
        return 'Starter';
    }
    normalizeSubscriptionStatus(value) {
        const raw = String(value ?? '').trim().toLowerCase();
        if (raw === 'active')
            return 'active';
        if (raw === 'past_due')
            return 'past_due';
        if (raw === 'cancelled')
            return 'cancelled';
        return 'trial';
    }
    normalizeMode(value) {
        return String(value ?? '').trim().toLowerCase() === 'live'
            ? 'live'
            : 'test';
    }
    toAdminStatus(isActive, passwordHash) {
        if (!isActive)
            return 'disabled';
        if (passwordHash === 'invite-pending')
            return 'invited';
        return 'active';
    }
    toTicketRecord(key, payload, updatedAt) {
        return {
            id: key.replace('ticket:', ''),
            storeName: this.asString(payload.storeName, 'Unknown Store'),
            category: this.normalizeTicketCategory(payload.category),
            priority: this.normalizeTicketPriority(payload.priority),
            status: this.normalizeTicketStatus(payload.status),
            slaHours: this.asNumber(payload.slaHours, 24),
            createdAt: this.asString(payload.createdAt, updatedAt.toISOString()),
            note: this.asString(payload.note, ''),
        };
    }
    toIncidentRecord(key, payload, updatedAt) {
        return {
            id: this.asString(payload.id, key.replace('incident:', '')),
            title: this.asString(payload.title, 'Untitled incident'),
            level: this.normalizeIncidentLevel(payload.level),
            startedAt: this.asString(payload.startedAt, updatedAt.toISOString()),
            status: this.normalizeIncidentStatus(payload.status),
            note: this.asString(payload.note, ''),
            resolutionNote: this.asString(payload.resolutionNote, ''),
            resolvedAt: this.asString(payload.resolvedAt, ''),
            updatedAt: updatedAt.toISOString(),
        };
    }
    riskFromAction(action) {
        const raw = action.trim().toLowerCase();
        if (raw.includes('delete') ||
            raw.includes('reset') ||
            raw.includes('security') ||
            raw.includes('password')) {
            return 'high';
        }
        if (raw.includes('update') ||
            raw.includes('status') ||
            raw.includes('retry') ||
            raw.includes('cancel')) {
            return 'medium';
        }
        return 'low';
    }
    normalizeTicketCategory(value) {
        const raw = String(value ?? '').trim().toLowerCase();
        if (raw === 'payment')
            return 'payment';
        if (raw === 'shipping')
            return 'shipping';
        if (raw === 'auth')
            return 'auth';
        return 'bug';
    }
    normalizeTicketPriority(value) {
        const raw = String(value ?? '').trim().toLowerCase();
        if (raw === 'low')
            return 'low';
        if (raw === 'high')
            return 'high';
        return 'medium';
    }
    normalizeTicketStatus(value) {
        const raw = String(value ?? '').trim().toLowerCase();
        if (raw === 'in_progress')
            return 'in_progress';
        if (raw === 'resolved')
            return 'resolved';
        return 'open';
    }
    normalizeIncidentLevel(value) {
        const raw = String(value ?? '').trim().toLowerCase();
        if (raw === 'info')
            return 'info';
        if (raw === 'critical')
            return 'critical';
        return 'warning';
    }
    normalizeIncidentStatus(value) {
        const raw = String(value ?? '').trim().toLowerCase();
        if (raw === 'resolved')
            return 'resolved';
        return 'monitoring';
    }
    asRecord(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return {};
        }
        return value;
    }
    asString(value, fallback) {
        if (typeof value !== 'string')
            return fallback;
        const next = value.trim();
        return next || fallback;
    }
    asNumber(value, fallback) {
        const next = Number(value);
        return Number.isFinite(next) ? next : fallback;
    }
    asBoolean(value, fallback) {
        if (typeof value === 'boolean')
            return value;
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return fallback;
    }
    slugify(value) {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    async generateUniqueSlug(name) {
        const base = this.slugify(name) || `store-${Date.now().toString(36)}`;
        let slug = base;
        let i = 1;
        while (await this.prisma.store.findUnique({
            where: { slug },
            select: { id: true },
        })) {
            slug = `${base}-${i}`;
            i += 1;
        }
        return slug;
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map