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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let CategoriesService = class CategoriesService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async create(storeId, data, actor) {
        const category = await this.prisma.category.create({
            data: {
                storeId,
                name: data.name,
                slug: data.slug,
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'category.create',
            entityType: 'Category',
            entityId: category.id,
            metaJson: { storeId },
        });
        return category;
    }
    list(storeId) {
        return this.prisma.category.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(storeId, categoryId, data, actor) {
        const existing = await this.prisma.category.findFirst({
            where: { id: categoryId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Category not found');
        const updated = await this.prisma.category.update({
            where: { id: categoryId },
            data,
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'category.update',
            entityType: 'Category',
            entityId: categoryId,
            metaJson: { storeId },
        });
        return updated;
    }
    async remove(storeId, categoryId, actor) {
        const existing = await this.prisma.category.findFirst({
            where: { id: categoryId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Category not found');
        await this.prisma.product.updateMany({
            where: { categoryId },
            data: { categoryId: null },
        });
        const deleted = await this.prisma.category.delete({
            where: { id: categoryId },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'category.delete',
            entityType: 'Category',
            entityId: categoryId,
            metaJson: { storeId },
        });
        return deleted;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map