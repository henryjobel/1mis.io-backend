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
exports.ShippingService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ShippingService = class ShippingService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async getConfig(storeId) {
        const config = await this.prisma.platformSetting.findUnique({
            where: { key: `shipping_config:${storeId}` },
        });
        return this.normalizeConfig(config?.valueJson);
    }
    async upsertConfig(storeId, data, actor) {
        const existing = await this.prisma.platformSetting.findUnique({
            where: { key: `shipping_config:${storeId}` },
        });
        const base = this.normalizeConfig(existing?.valueJson);
        const incoming = this.normalizeConfig(data);
        const normalized = {
            methods: data.methods ? incoming.methods : base.methods,
            charges: data.charges ? incoming.charges : base.charges,
            rates: data.rates !== undefined ? incoming.rates : base.rates,
        };
        const saved = await this.prisma.platformSetting.upsert({
            where: { key: `shipping_config:${storeId}` },
            create: {
                key: `shipping_config:${storeId}`,
                valueJson: normalized,
            },
            update: { valueJson: normalized },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'shipping.config.upsert',
            entityType: 'PlatformSetting',
            entityId: saved.key,
        });
        return normalized;
    }
    async shipOrder(storeId, data, actor) {
        const order = await this.prisma.order.findFirst({
            where: { id: data.orderId, storeId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const shipment = await this.prisma.shipment.upsert({
            where: { orderId: order.id },
            create: {
                storeId,
                orderId: order.id,
                courier: data.courier,
                trackingNumber: data.trackingNumber,
                trackingUrl: data.trackingUrl,
                estimatedDelivery: data.estimatedDelivery
                    ? new Date(data.estimatedDelivery)
                    : undefined,
                shippedAt: new Date(),
                status: 'shipped',
            },
            update: {
                courier: data.courier,
                trackingNumber: data.trackingNumber,
                trackingUrl: data.trackingUrl,
                estimatedDelivery: data.estimatedDelivery
                    ? new Date(data.estimatedDelivery)
                    : undefined,
                shippedAt: new Date(),
                status: 'shipped',
            },
        });
        await this.prisma.order.update({
            where: { id: order.id },
            data: { status: client_1.OrderStatus.shipped },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'shipping.ship_order',
            entityType: 'Shipment',
            entityId: shipment.id,
        });
        return shipment;
    }
    async updateTracking(storeId, shipmentId, status, actor) {
        const existing = await this.prisma.shipment.findFirst({
            where: { id: shipmentId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Shipment not found');
        const deliveredAt = status === 'delivered' ? new Date() : null;
        const updated = await this.prisma.shipment.update({
            where: { id: shipmentId },
            data: { status, deliveredAt: deliveredAt ?? undefined },
        });
        if (status === 'delivered') {
            await this.prisma.order.update({
                where: { id: existing.orderId },
                data: { status: client_1.OrderStatus.delivered },
            });
        }
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'shipping.tracking.update',
            entityType: 'Shipment',
            entityId: shipmentId,
            metaJson: { status },
        });
        return updated;
    }
    async shipments(storeId, options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
        const where = {
            storeId,
            ...(options?.status ? { status: options.status } : {}),
            ...(options?.from || options?.to
                ? {
                    createdAt: {
                        ...(options?.from ? { gte: new Date(options.from) } : {}),
                        ...(options?.to ? { lte: new Date(options.to) } : {}),
                    },
                }
                : {}),
            ...(options?.q
                ? {
                    OR: [
                        { courier: { contains: options.q, mode: 'insensitive' } },
                        {
                            trackingNumber: {
                                contains: options.q,
                                mode: 'insensitive',
                            },
                        },
                        {
                            order: {
                                OR: [
                                    { code: { contains: options.q, mode: 'insensitive' } },
                                    {
                                        customerName: {
                                            contains: options.q,
                                            mode: 'insensitive',
                                        },
                                    },
                                    {
                                        customerEmail: {
                                            contains: options.q,
                                            mode: 'insensitive',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                }
                : {}),
        };
        const orderBy = this.shipmentSort(options?.sort);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.shipment.findMany({
                where,
                include: { order: true },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.shipment.count({ where }),
        ]);
        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async orders(storeId, options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
        const normalizedStatus = this.parseOrderStatus(options?.status);
        const where = {
            storeId,
            ...(normalizedStatus ? { status: normalizedStatus } : {}),
            ...(options?.from || options?.to
                ? {
                    createdAt: {
                        ...(options?.from ? { gte: new Date(options.from) } : {}),
                        ...(options?.to ? { lte: new Date(options.to) } : {}),
                    },
                }
                : {}),
            ...(options?.q
                ? {
                    OR: [
                        { code: { contains: options.q, mode: 'insensitive' } },
                        { customerName: { contains: options.q, mode: 'insensitive' } },
                        { customerEmail: { contains: options.q, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };
        const skip = (page - 1) * limit;
        const orderBy = this.orderSort(options?.sort);
        const [orders, total, deliveryRows] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    shipment: true,
                    items: { select: { productId: true, productNameSnapshot: true } },
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where }),
            this.prisma.platformSetting.findMany({
                where: { key: { startsWith: `product_delivery:${storeId}:` } },
            }),
        ]);
        const deliveryMap = new Map();
        for (const row of deliveryRows) {
            const productId = row.key.replace(`product_delivery:${storeId}:`, '');
            const payload = this.asRecord(row.valueJson);
            deliveryMap.set(productId, this.asBoolean(payload.enabled, true));
        }
        const items = orders.map((order) => {
            const productIds = order.items
                .map((item) => item.productId)
                .filter((id) => Boolean(id));
            const blockedIds = productIds.filter((productId) => deliveryMap.get(productId) === false);
            const deliveryEligible = blockedIds.length === 0;
            return {
                id: order.id,
                code: order.code,
                status: this.toUiStatus(order.status),
                rawStatus: order.status,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                total: order.total,
                createdAt: order.createdAt,
                shipment: order.shipment,
                delivery: {
                    eligible: deliveryEligible,
                    blockedProductIds: blockedIds,
                },
            };
        });
        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async shipment(storeId, shipmentId) {
        const shipment = await this.prisma.shipment.findFirst({
            where: { id: shipmentId, storeId },
            include: { order: { include: { items: true, paymentTxns: true } } },
        });
        if (!shipment)
            throw new common_1.NotFoundException('Shipment not found');
        return shipment;
    }
    normalizeConfig(value) {
        const payload = this.asRecord(value);
        const methods = this.asRecord(payload.methods);
        const charges = this.asRecord(payload.charges);
        const ratesRaw = Array.isArray(payload.rates) ? payload.rates : [];
        const rates = ratesRaw
            .map((item) => this.asRecord(item))
            .filter((item) => this.asString(item.name, '') &&
            this.asString(item.country, '') &&
            Number.isFinite(Number(item.amount)))
            .map((item) => ({
            name: this.asString(item.name, ''),
            country: this.asString(item.country, ''),
            amount: Number(item.amount),
        }));
        return {
            methods: {
                standard: this.asBoolean(methods.standard, true),
                express: this.asBoolean(methods.express, false),
                pickup: this.asBoolean(methods.pickup, true),
                cod: this.asBoolean(methods.cod, true),
            },
            charges: {
                flatCharge: this.asNumber(charges.flatCharge, 0),
                expressCharge: this.asNumber(charges.expressCharge, 0),
            },
            rates,
        };
    }
    shipmentSort(sort) {
        const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
        if (key === 'createdat_asc')
            return { createdAt: 'asc' };
        if (key === 'status_asc')
            return { status: 'asc' };
        if (key === 'status_desc')
            return { status: 'desc' };
        return { createdAt: 'desc' };
    }
    orderSort(sort) {
        const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
        if (key === 'createdat_asc')
            return { createdAt: 'asc' };
        if (key === 'total_desc')
            return { total: 'desc' };
        if (key === 'total_asc')
            return { total: 'asc' };
        return { createdAt: 'desc' };
    }
    parseOrderStatus(value) {
        if (!value)
            return undefined;
        const raw = String(value).trim().toLowerCase();
        if (raw === 'completed')
            return client_1.OrderStatus.delivered;
        return Object.values(client_1.OrderStatus).find((status) => status === raw);
    }
    toUiStatus(status) {
        if (status === client_1.OrderStatus.delivered)
            return 'completed';
        return status;
    }
    asRecord(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value))
            return {};
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
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ShippingService);
//# sourceMappingURL=shipping.service.js.map