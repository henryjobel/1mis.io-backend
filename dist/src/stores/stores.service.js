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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const billing_service_1 = require("../billing/billing.service");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
const SUPER_ROLES = [
    client_1.Role.super_admin,
    client_1.Role.ops,
    client_1.Role.support,
    client_1.Role.finance,
];
let StoresService = class StoresService {
    constructor(prisma, auditService, billingService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.billingService = billingService;
    }
    async create(ownerId, data) {
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
    async list(user) {
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
    findOne(id) {
        return this.prisma.store.findUnique({
            where: { id },
            include: { trackingConfig: true, themeConfig: true },
        });
    }
    async update(id, data, actor) {
        const store = await this.prisma.store.update({ where: { id }, data });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'store.update',
            entityType: 'Store',
            entityId: id,
            metaJson: data,
        });
        return store;
    }
    async publish(id, actor) {
        await this.billingService.assertPublishAllowed(id);
        const store = await this.prisma.store.update({
            where: { id },
            data: { status: client_1.StoreStatus.active, publishedAt: new Date() },
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
    async upsertTracking(storeId, data, actor) {
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
    async upsertTheme(storeId, data, actor) {
        const theme = await this.prisma.themeConfig.upsert({
            where: { storeId },
            create: {
                storeId,
                preset: data.preset,
                customJson: data.customJson,
            },
            update: {
                preset: data.preset,
                customJson: data.customJson,
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
    async getMarketing(storeId) {
        const row = await this.prisma.platformSetting.findUnique({
            where: { key: `marketing:${storeId}` },
        });
        return row?.valueJson ?? {};
    }
    async upsertMarketing(storeId, data, actor) {
        const saved = await this.prisma.platformSetting.upsert({
            where: { key: `marketing:${storeId}` },
            create: {
                key: `marketing:${storeId}`,
                valueJson: data,
            },
            update: { valueJson: data },
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
    async getContent(storeId) {
        const row = await this.prisma.platformSetting.findUnique({
            where: { key: `store_content:${storeId}` },
        });
        return row?.valueJson ?? {};
    }
    async upsertContent(storeId, data, actor) {
        const saved = await this.prisma.platformSetting.upsert({
            where: { key: `store_content:${storeId}` },
            create: {
                key: `store_content:${storeId}`,
                valueJson: data,
            },
            update: { valueJson: data },
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
    async connectDomain(storeId, domain, actor) {
        await this.billingService.assertCustomDomainAllowed(storeId);
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
                valueJson: value,
            },
            update: { valueJson: value },
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
    async verifyDomain(storeId, actor) {
        const existing = await this.prisma.platformSetting.findUnique({
            where: { key: `domain:${storeId}` },
        });
        const current = existing?.valueJson ?? {};
        const next = {
            ...current,
            domainStatus: 'connected',
            verifiedAt: new Date().toISOString(),
        };
        const saved = await this.prisma.platformSetting.upsert({
            where: { key: `domain:${storeId}` },
            create: {
                key: `domain:${storeId}`,
                valueJson: next,
            },
            update: { valueJson: next },
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
    async buyDomain(storeId, data, actor) {
        await this.billingService.assertCustomDomainAllowed(storeId);
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
                valueJson: value,
            },
            update: { valueJson: value },
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
    async refreshSsl(storeId, actor) {
        const existing = await this.prisma.platformSetting.findUnique({
            where: { key: `domain:${storeId}` },
        });
        const current = existing?.valueJson ?? {};
        const next = {
            ...current,
            sslStatus: 'active',
            sslRefreshedAt: new Date().toISOString(),
        };
        const saved = await this.prisma.platformSetting.upsert({
            where: { key: `domain:${storeId}` },
            create: {
                key: `domain:${storeId}`,
                valueJson: next,
            },
            update: { valueJson: next },
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
    async assertStoreAccess(storeId, user) {
        if (SUPER_ROLES.includes(user.role))
            return;
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
        });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        if (store.ownerId === user.id)
            return;
        const member = await this.prisma.storeMember.findUnique({
            where: { storeId_userId: { storeId, userId: user.id } },
        });
        if (!member)
            throw new common_1.ForbiddenException('No access to this store');
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        billing_service_1.BillingService])
], StoresService);
//# sourceMappingURL=stores.service.js.map