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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async summary(storeId, threshold = 5) {
        const safeThreshold = this.normalizeThreshold(threshold);
        const [products, variants] = await Promise.all([
            this.prisma.product.findMany({
                where: { storeId },
                select: {
                    id: true,
                    title: true,
                    stock: true,
                    price: true,
                    status: true,
                },
            }),
            this.prisma.productVariant.findMany({
                where: { product: { storeId } },
                select: {
                    id: true,
                    productId: true,
                    stock: true,
                    price: true,
                    product: {
                        select: {
                            title: true,
                            price: true,
                        },
                    },
                },
            }),
        ]);
        const variantCountByProduct = new Map();
        for (const row of variants) {
            variantCountByProduct.set(row.productId, (variantCountByProduct.get(row.productId) ?? 0) + 1);
        }
        const activeProducts = products.filter((row) => row.status === 'active');
        const lowStockProducts = activeProducts.filter((row) => row.stock <= safeThreshold);
        const outOfStockProducts = activeProducts.filter((row) => row.stock <= 0);
        const lowStockVariants = variants.filter((row) => row.stock <= safeThreshold);
        const outOfStockVariants = variants.filter((row) => row.stock <= 0);
        const productsValue = activeProducts
            .filter((row) => !variantCountByProduct.has(row.id))
            .reduce((sum, row) => sum + Number(row.price) * row.stock, 0);
        const variantsValue = variants.reduce((sum, row) => {
            const unit = row.price != null ? Number(row.price) : Number(row.product.price);
            return sum + unit * row.stock;
        }, 0);
        return {
            threshold: safeThreshold,
            products: {
                total: products.length,
                active: activeProducts.length,
                lowStock: lowStockProducts.length,
                outOfStock: outOfStockProducts.length,
            },
            variants: {
                total: variants.length,
                lowStock: lowStockVariants.length,
                outOfStock: outOfStockVariants.length,
            },
            inventoryValueUsd: Number((productsValue + variantsValue).toFixed(2)),
        };
    }
    async lowStock(storeId, options) {
        const threshold = this.normalizeThreshold(options?.threshold);
        const includeVariants = options?.includeVariants ?? false;
        const products = await this.prisma.product.findMany({
            where: {
                storeId,
                stock: { lte: threshold },
            },
            orderBy: [{ stock: 'asc' }, { updatedAt: 'asc' }],
            select: {
                id: true,
                title: true,
                stock: true,
                status: true,
                sku: true,
                updatedAt: true,
            },
            take: 200,
        });
        const productAlerts = products.map((row) => ({
            type: 'product',
            id: row.id,
            name: row.title,
            sku: row.sku,
            stock: row.stock,
            threshold,
            level: this.stockLevel(row.stock, threshold),
            status: row.status,
            updatedAt: row.updatedAt.toISOString(),
        }));
        const variantAlerts = includeVariants
            ? (await this.prisma.productVariant.findMany({
                where: {
                    stock: { lte: threshold },
                    product: { storeId },
                },
                orderBy: [{ stock: 'asc' }, { updatedAt: 'asc' }],
                select: {
                    id: true,
                    optionName: true,
                    optionValue: true,
                    sku: true,
                    stock: true,
                    updatedAt: true,
                    productId: true,
                    product: { select: { title: true, status: true } },
                },
                take: 200,
            })).map((row) => ({
                type: 'variant',
                id: row.id,
                productId: row.productId,
                productName: row.product.title,
                name: `${row.optionName}: ${row.optionValue}`,
                sku: row.sku,
                stock: row.stock,
                threshold,
                level: this.stockLevel(row.stock, threshold),
                status: row.product.status,
                updatedAt: row.updatedAt.toISOString(),
            }))
            : [];
        return {
            threshold,
            includeVariants,
            totalAlerts: productAlerts.length + variantAlerts.length,
            products: productAlerts,
            variants: variantAlerts,
        };
    }
    normalizeThreshold(value) {
        if (value == null || Number.isNaN(value))
            return 5;
        return Math.max(0, Math.floor(value));
    }
    stockLevel(stock, threshold) {
        if (stock <= 0)
            return 'out';
        if (stock <= Math.max(1, Math.floor(threshold / 2)))
            return 'critical';
        return 'low';
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map