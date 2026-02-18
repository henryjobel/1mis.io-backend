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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async create(storeId, data, actor) {
        const product = await this.prisma.product.create({
            data: {
                storeId,
                title: data.title,
                description: data.description,
                sku: data.sku,
                imageUrl: data.imageUrl,
                categoryId: data.categoryId,
                price: data.price,
                stock: data.stock ?? 0,
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'product.create',
            entityType: 'Product',
            entityId: product.id,
            metaJson: { storeId },
        });
        return product;
    }
    list(storeId) {
        return this.prisma.product.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(storeId, productId) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, storeId },
            include: { variants: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async update(storeId, productId, data, actor) {
        const existing = await this.prisma.product.findFirst({
            where: { id: productId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Product not found');
        const updated = await this.prisma.product.update({
            where: { id: productId },
            data,
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'product.update',
            entityType: 'Product',
            entityId: productId,
        });
        return updated;
    }
    async delete(storeId, productId, actor) {
        const existing = await this.prisma.product.findFirst({
            where: { id: productId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Product not found');
        const deleted = await this.prisma.product.delete({
            where: { id: productId },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'product.delete',
            entityType: 'Product',
            entityId: productId,
        });
        return deleted;
    }
    async createVariant(storeId, productId, data, actor) {
        await this.assertProductInStore(storeId, productId);
        const variant = await this.prisma.productVariant.create({
            data: {
                productId,
                optionName: data.optionName,
                optionValue: data.optionValue,
                sku: data.sku,
                price: data.price,
                stock: data.stock ?? 0,
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'product.variant.create',
            entityType: 'ProductVariant',
            entityId: variant.id,
            metaJson: { storeId, productId },
        });
        return variant;
    }
    async listVariants(storeId, productId) {
        await this.assertProductInStore(storeId, productId);
        return this.prisma.productVariant.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateVariant(storeId, productId, variantId, data, actor) {
        await this.assertProductInStore(storeId, productId);
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant)
            throw new common_1.NotFoundException('Variant not found');
        const updated = await this.prisma.productVariant.update({
            where: { id: variantId },
            data,
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'product.variant.update',
            entityType: 'ProductVariant',
            entityId: variantId,
            metaJson: { storeId, productId },
        });
        return updated;
    }
    async deleteVariant(storeId, productId, variantId, actor) {
        await this.assertProductInStore(storeId, productId);
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant)
            throw new common_1.NotFoundException('Variant not found');
        const deleted = await this.prisma.productVariant.delete({
            where: { id: variantId },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'product.variant.delete',
            entityType: 'ProductVariant',
            entityId: variantId,
            metaJson: { storeId, productId },
        });
        return deleted;
    }
    async assertProductInStore(storeId, productId) {
        const existing = await this.prisma.product.findFirst({
            where: { id: productId, storeId },
            select: { id: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Product not found');
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ProductsService);
//# sourceMappingURL=products.service.js.map