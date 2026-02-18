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
    stores() {
        return this.prisma.store.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async updateStoreStatus(id, status, actor) {
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
    async lifecycleByStore(storeId) {
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
    async updateLifecycle(storeId, payload, actor) {
        const store = await this.prisma.store.findUnique({
            where: { id: storeId },
        });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        const updated = await this.prisma.platformSetting.upsert({
            where: { key: `lifecycle:${storeId}` },
            create: {
                key: `lifecycle:${storeId}`,
                valueJson: payload,
            },
            update: { valueJson: payload },
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
                role: { in: [client_1.Role.super_admin, client_1.Role.ops, client_1.Role.support, client_1.Role.finance] },
            },
            select: { id: true, name: true, email: true, role: true, isActive: true },
        });
    }
    async inviteAdmin(data, actor) {
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
    async paymentOpsByStore(storeId) {
        const config = await this.prisma.platformSetting.findUnique({
            where: { key: `payment_ops:${storeId}` },
        });
        return {
            storeId,
            config: config?.valueJson ?? null,
            message: 'Store payment ops configuration',
        };
    }
    async updatePaymentOps(storeId, payload, actor) {
        const updated = await this.prisma.platformSetting.upsert({
            where: { key: `payment_ops:${storeId}` },
            create: {
                key: `payment_ops:${storeId}`,
                valueJson: payload,
            },
            update: { valueJson: payload },
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
                ...row.valueJson,
            })),
            note: rows.length
                ? 'Ticket data loaded from platform settings'
                : 'Ticketing placeholder',
        };
    }
    async ticket(id) {
        const row = await this.prisma.platformSetting.findUnique({
            where: { key: `ticket:${id}` },
        });
        return {
            id,
            ...row?.valueJson,
            note: row ? 'Ticket details' : 'Ticket details placeholder',
        };
    }
    async updateTicket(id, payload, actor) {
        const updated = await this.prisma.platformSetting.upsert({
            where: { key: `ticket:${id}` },
            create: {
                key: `ticket:${id}`,
                valueJson: payload,
            },
            update: { valueJson: payload },
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
    restartService(service) {
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
    async upsertFlag(key, enabled, description, actor) {
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
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map