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
        return config?.valueJson ?? { rates: [] };
    }
    async upsertConfig(storeId, data, actor) {
        const saved = await this.prisma.platformSetting.upsert({
            where: { key: `shipping_config:${storeId}` },
            create: {
                key: `shipping_config:${storeId}`,
                valueJson: data,
            },
            update: { valueJson: data },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'shipping.config.upsert',
            entityType: 'PlatformSetting',
            entityId: saved.key,
        });
        return saved;
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
    shipments(storeId) {
        return this.prisma.shipment.findMany({
            where: { storeId },
            include: { order: true },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ShippingService);
//# sourceMappingURL=shipping.service.js.map