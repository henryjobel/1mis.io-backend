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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async overview(storeId, from, to) {
        const where = {
            storeId,
            ...(from || to
                ? {
                    createdAt: {
                        ...(from ? { gte: new Date(from) } : {}),
                        ...(to ? { lte: new Date(to) } : {}),
                    },
                }
                : {}),
        };
        const [ordersCount, totalRevenue, aov, statusBreakdown] = await Promise.all([
            this.prisma.order.count({ where }),
            this.prisma.order.aggregate({ where, _sum: { total: true } }),
            this.prisma.order.aggregate({ where, _avg: { total: true } }),
            this.prisma.order.groupBy({ by: ['status'], where, _count: true }),
        ]);
        return {
            ordersCount,
            totalRevenue: totalRevenue._sum.total ?? 0,
            averageOrderValue: aov._avg.total ?? 0,
            statusBreakdown,
        };
    }
    async topProducts(storeId) {
        const rows = await this.prisma.orderItem.groupBy({
            by: ['productId', 'productNameSnapshot'],
            where: { order: { storeId } },
            _sum: { qty: true, unitPrice: true },
            orderBy: { _sum: { qty: 'desc' } },
            take: 10,
        });
        return rows.map((row) => ({
            productId: row.productId,
            productName: row.productNameSnapshot,
            totalQty: row._sum.qty ?? 0,
            revenueApprox: row._sum.unitPrice ?? 0,
        }));
    }
    async dashboard(storeId, from, to) {
        const createdAt = from || to
            ? {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to) } : {}),
            }
            : undefined;
        const orderWhere = createdAt ? { storeId, createdAt } : { storeId };
        const [orderStats, totalOrders, completedOrders, customerCount, activeProducts, lowStockProducts, lowStockVariants,] = await Promise.all([
            this.prisma.order.aggregate({
                where: orderWhere,
                _sum: { total: true },
                _avg: { total: true },
            }),
            this.prisma.order.count({ where: orderWhere }),
            this.prisma.order.count({
                where: {
                    ...orderWhere,
                    status: { in: ['paid', 'processing', 'shipped', 'delivered'] },
                },
            }),
            this.prisma.order
                .groupBy({
                by: ['customerEmail'],
                where: orderWhere,
            })
                .then((rows) => rows.length),
            this.prisma.product.count({
                where: { storeId, status: 'active' },
            }),
            this.prisma.product.count({
                where: { storeId, status: 'active', stock: { lte: 5 } },
            }),
            this.prisma.productVariant.count({
                where: {
                    stock: { lte: 5 },
                    product: { storeId, status: 'active' },
                },
            }),
        ]);
        const conversionRate = totalOrders > 0 ? Number(((completedOrders / totalOrders) * 100).toFixed(2)) : 0;
        return {
            from: from ?? null,
            to: to ?? null,
            revenue: orderStats._sum.total ?? 0,
            orders: totalOrders,
            averageOrderValue: orderStats._avg.total ?? 0,
            customers: customerCount,
            products: activeProducts,
            lowStockAlerts: lowStockProducts + lowStockVariants,
            conversionRatePct: conversionRate,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map