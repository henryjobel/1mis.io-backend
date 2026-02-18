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
const prisma_service_1 = require("../prisma/prisma.service");
let SuperAdminService = class SuperAdminService {
    constructor(prisma) {
        this.prisma = prisma;
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
    updateStoreStatus(id, status) {
        return this.prisma.store.update({ where: { id }, data: { status } });
    }
    lifecycle() {
        return this.prisma.store.groupBy({ by: ['status'], _count: true });
    }
    lifecycleByStore(storeId) {
        return this.prisma.store.findUnique({ where: { id: storeId } });
    }
    admins() {
        return this.prisma.user.findMany({
            where: { role: { in: [client_1.Role.super_admin, client_1.Role.ops, client_1.Role.support, client_1.Role.finance] } },
            select: { id: true, name: true, email: true, role: true, isActive: true },
        });
    }
    async inviteAdmin(data) {
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
    paymentOpsByStore(storeId) {
        return { storeId, status: 'ok', message: 'Store payment ops placeholder' };
    }
    tickets() {
        return { items: [], note: 'Ticketing placeholder' };
    }
    ticket(id) {
        return { id, status: 'open', note: 'Ticket details placeholder' };
    }
    health() {
        return { status: 'healthy', services: ['api', 'postgres', 'redis'] };
    }
    restartService(service) {
        return { service, restarted: true, mode: 'simulated' };
    }
    async aiUsage() {
        const grouped = await this.prisma.aiGenerationJob.groupBy({ by: ['status'], _count: true });
        return { grouped };
    }
    flags() {
        return this.prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
    }
    upsertFlag(key, enabled, description) {
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
    upsertSetting(key, valueJson) {
        return this.prisma.platformSetting.upsert({
            where: { key },
            create: { key, valueJson: valueJson },
            update: { valueJson: valueJson },
        });
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map