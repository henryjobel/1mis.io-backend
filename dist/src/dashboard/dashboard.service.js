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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async overview(storeId) {
        const [store, orderAgg, ordersCount, completedOrders, customersGrouped, lowStockProducts, lowStockVariants, productsSoldAgg, recentOrders, domainSetting, paymentOps, paymentConfig,] = await Promise.all([
            this.prisma.store.findUnique({
                where: { id: storeId },
                select: { id: true, publishedAt: true, slug: true },
            }),
            this.prisma.order.aggregate({
                where: { storeId },
                _sum: { total: true },
            }),
            this.prisma.order.count({ where: { storeId } }),
            this.prisma.order.count({
                where: {
                    storeId,
                    status: {
                        in: [
                            client_1.OrderStatus.paid,
                            client_1.OrderStatus.processing,
                            client_1.OrderStatus.shipped,
                            client_1.OrderStatus.delivered,
                        ],
                    },
                },
            }),
            this.prisma.order.groupBy({
                by: ['customerEmail'],
                where: { storeId },
            }),
            this.prisma.product.count({
                where: { storeId, status: 'active', stock: { lte: 5 } },
            }),
            this.prisma.productVariant.count({
                where: { stock: { lte: 5 }, product: { storeId, status: 'active' } },
            }),
            this.prisma.orderItem.aggregate({
                where: { order: { storeId } },
                _sum: { qty: true },
            }),
            this.prisma.order.findMany({
                where: { storeId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    code: true,
                    customerName: true,
                    customerEmail: true,
                    total: true,
                    status: true,
                    createdAt: true,
                },
            }),
            this.prisma.platformSetting.findUnique({
                where: { key: `domain:${storeId}` },
            }),
            this.prisma.platformSetting.findUnique({
                where: { key: `payment_ops:${storeId}` },
            }),
            this.prisma.platformSetting.findUnique({
                where: { key: `payment_config:${storeId}` },
            }),
        ]);
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        const conversionRatePct = ordersCount > 0
            ? Number(((completedOrders / ordersCount) * 100).toFixed(2))
            : 0;
        const domainJson = this.asRecord(domainSetting?.valueJson);
        const paymentOpsJson = this.asRecord(paymentOps?.valueJson);
        const paymentConfigJson = this.asRecord(paymentConfig?.valueJson);
        return {
            stats: {
                totalRevenue: Number(orderAgg._sum.total ?? 0),
                orders: ordersCount,
                customers: customersGrouped.length,
                conversionRatePct,
                lowStockAlerts: lowStockProducts + lowStockVariants,
                productsSold: productsSoldAgg._sum.qty ?? 0,
            },
            recentOrders: recentOrders.map((order) => ({
                id: order.id,
                code: order.code,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                total: Number(order.total),
                status: this.toUiStatus(order.status),
                rawStatus: order.status,
                createdAt: order.createdAt.toISOString(),
            })),
            website: {
                domain: this.asString(domainJson.domain, '') || `${store.slug}.1mis.io`,
                domainStatus: this.asString(domainJson.domainStatus, 'not_connected'),
                sslStatus: this.asString(domainJson.sslStatus, 'inactive'),
                publishedAt: store.publishedAt?.toISOString() ?? null,
            },
            payments: {
                codEnabled: this.asBoolean(paymentOpsJson.codEnabled, this.asBoolean(paymentConfigJson.codEnabled, true)),
                stripeEnabled: this.asBoolean(paymentOpsJson.stripeEnabled, this.asBoolean(paymentConfigJson.stripeEnabled, true)),
                sslCommerzEnabled: this.asBoolean(paymentOpsJson.sslCommerzEnabled, this.asBoolean(paymentConfigJson.sslCommerzEnabled, false)),
                mode: this.normalizeMode(paymentOpsJson.mode ??
                    paymentOpsJson.stripeMode ??
                    paymentConfigJson.mode),
            },
        };
    }
    toUiStatus(status) {
        if (status === client_1.OrderStatus.delivered)
            return 'completed';
        return status;
    }
    normalizeMode(value) {
        return String(value ?? '').trim().toLowerCase() === 'live'
            ? 'live'
            : 'test';
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
    asBoolean(value, fallback) {
        if (typeof value === 'boolean')
            return value;
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return fallback;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map