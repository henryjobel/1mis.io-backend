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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async list(storeId, options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
        const normalizedStatus = this.parseOrderStatus(options?.status);
        const where = {
            storeId,
            ...(normalizedStatus ? { status: normalizedStatus } : {}),
            ...(options?.q
                ? {
                    OR: [
                        { code: { contains: options.q, mode: 'insensitive' } },
                        { customerName: { contains: options.q, mode: 'insensitive' } },
                        { customerEmail: { contains: options.q, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(options?.from || options?.to
                ? {
                    createdAt: {
                        ...(options?.from ? { gte: new Date(options.from) } : {}),
                        ...(options?.to ? { lte: new Date(options.to) } : {}),
                    },
                }
                : {}),
        };
        const orderBy = this.orderSort(options?.sort);
        const skip = (page - 1) * limit;
        const [rows, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: { items: true },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);
        const items = rows.map((order) => ({
            ...order,
            rawStatus: order.status,
            status: this.toUiStatus(order.status),
        }));
        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async findOne(storeId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, storeId },
            include: {
                items: true,
                shipment: true,
                paymentTxns: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return {
            ...order,
            rawStatus: order.status,
            status: this.toUiStatus(order.status),
        };
    }
    async updateStatus(storeId, orderId, status, actor) {
        const existing = await this.prisma.order.findFirst({
            where: { id: orderId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Order not found');
        const normalizedStatus = this.parseOrderStatus(status, true);
        const order = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: normalizedStatus },
            include: { items: true },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'order.status.update',
            entityType: 'Order',
            entityId: orderId,
            metaJson: { status: normalizedStatus },
        });
        return {
            ...order,
            rawStatus: order.status,
            status: this.toUiStatus(order.status),
        };
    }
    parseOrderStatus(value, strict = false) {
        if (!value)
            return undefined;
        const raw = String(value).trim().toLowerCase();
        if (raw === 'completed')
            return client_1.OrderStatus.delivered;
        const valid = Object.values(client_1.OrderStatus).find((item) => item.toLowerCase() === raw);
        if (valid)
            return valid;
        if (strict) {
            throw new common_1.BadRequestException('Invalid order status. Use pending/paid/processing/shipped/delivered/completed/cancelled');
        }
        return undefined;
    }
    toUiStatus(status) {
        if (status === client_1.OrderStatus.delivered)
            return 'completed';
        return status;
    }
    orderSort(sort) {
        const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
        if (key === 'createdat_asc')
            return { createdAt: 'asc' };
        if (key === 'total_desc')
            return { total: 'desc' };
        if (key === 'total_asc')
            return { total: 'asc' };
        if (key === 'status_asc')
            return { status: 'asc' };
        if (key === 'status_desc')
            return { status: 'desc' };
        return { createdAt: 'desc' };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map