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
const prisma_service_1 = require("../prisma/prisma.service");
const SUPER_ROLES = [client_1.Role.super_admin, client_1.Role.ops, client_1.Role.support, client_1.Role.finance];
let StoresService = class StoresService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(ownerId, data) {
        return this.prisma.store.create({
            data: {
                ownerId,
                name: data.name,
                slug: data.slug,
                themePreset: data.themePreset,
            },
        });
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
    update(id, data) {
        return this.prisma.store.update({ where: { id }, data });
    }
    publish(id) {
        return this.prisma.store.update({
            where: { id },
            data: { status: client_1.StoreStatus.active, publishedAt: new Date() },
        });
    }
    upsertTracking(storeId, data) {
        return this.prisma.trackingConfig.upsert({
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
    }
    upsertTheme(storeId, data) {
        return this.prisma.themeConfig.upsert({
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
    }
    async assertStoreAccess(storeId, user) {
        if (SUPER_ROLES.includes(user.role))
            return;
        const store = await this.prisma.store.findUnique({ where: { id: storeId } });
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoresService);
//# sourceMappingURL=stores.service.js.map