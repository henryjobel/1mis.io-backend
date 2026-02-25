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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async getConfig(storeId) {
        const config = await this.prisma.platformSetting.findUnique({
            where: { key: `payment_config:${storeId}` },
        });
        return config?.valueJson ?? { provider: 'stripe', mode: 'test' };
    }
    async upsertConfig(storeId, data, actor) {
        const setting = await this.prisma.platformSetting.upsert({
            where: { key: `payment_config:${storeId}` },
            create: {
                key: `payment_config:${storeId}`,
                valueJson: data,
            },
            update: { valueJson: data },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'payment.config.upsert',
            entityType: 'PlatformSetting',
            entityId: setting.key,
        });
        return setting;
    }
    async createIntent(storeId, data, actor) {
        const provider = data.provider ?? 'stripe';
        const tx = await this.prisma.paymentTransaction.create({
            data: {
                storeId,
                orderId: data.orderId,
                provider,
                amount: data.amount,
                currency: data.currency ?? 'USD',
                status: 'requires_confirmation',
                metadata: { simulated: true, clientSecret: `pi_${Date.now()}` },
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'payment.intent.create',
            entityType: 'PaymentTransaction',
            entityId: tx.id,
        });
        return tx;
    }
    async confirm(storeId, data, actor) {
        const tx = await this.prisma.paymentTransaction.findFirst({
            where: { id: data.transactionId, storeId },
        });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found');
        const updated = await this.prisma.paymentTransaction.update({
            where: { id: tx.id },
            data: {
                status: data.status ?? 'succeeded',
                providerRef: data.providerRef,
            },
        });
        if (updated.orderId) {
            await this.prisma.order.update({
                where: { id: updated.orderId },
                data: { status: client_1.OrderStatus.paid },
            });
        }
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'payment.confirm',
            entityType: 'PaymentTransaction',
            entityId: tx.id,
        });
        return updated;
    }
    async refund(storeId, data, actor) {
        const tx = await this.prisma.paymentTransaction.findFirst({
            where: { id: data.transactionId, storeId },
        });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found');
        const refunded = await this.prisma.paymentTransaction.create({
            data: {
                storeId,
                orderId: tx.orderId,
                provider: tx.provider,
                amount: data.amount ?? Number(tx.amount),
                currency: tx.currency,
                status: 'refunded',
                providerRef: tx.providerRef,
                metadata: { parentTransactionId: tx.id },
            },
        });
        if (tx.orderId) {
            await this.prisma.order.update({
                where: { id: tx.orderId },
                data: { status: client_1.OrderStatus.cancelled },
            });
        }
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'payment.refund',
            entityType: 'PaymentTransaction',
            entityId: refunded.id,
        });
        return refunded;
    }
    async transactions(storeId, options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
        const where = {
            storeId,
            ...(options?.status ? { status: options.status } : {}),
            ...(options?.q
                ? {
                    OR: [
                        { provider: { contains: options.q, mode: 'insensitive' } },
                        { providerRef: { contains: options.q, mode: 'insensitive' } },
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
            ...(options?.from || options?.to
                ? {
                    createdAt: {
                        ...(options?.from ? { gte: new Date(options.from) } : {}),
                        ...(options?.to ? { lte: new Date(options.to) } : {}),
                    },
                }
                : {}),
        };
        const skip = (page - 1) * limit;
        const orderBy = this.transactionSort(options?.sort);
        const [items, total] = await Promise.all([
            this.prisma.paymentTransaction.findMany({
                where,
                include: {
                    order: {
                        select: {
                            id: true,
                            code: true,
                            customerName: true,
                            customerEmail: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.paymentTransaction.count({ where }),
        ]);
        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async transaction(storeId, transactionId) {
        const tx = await this.prisma.paymentTransaction.findFirst({
            where: { id: transactionId, storeId },
            include: {
                order: {
                    include: {
                        items: true,
                        shipment: true,
                    },
                },
            },
        });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found');
        return tx;
    }
    transactionSort(sort) {
        const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
        if (key === 'createdat_asc')
            return { createdAt: 'asc' };
        if (key === 'amount_desc')
            return { amount: 'desc' };
        if (key === 'amount_asc')
            return { amount: 'asc' };
        if (key === 'status_asc')
            return { status: 'asc' };
        if (key === 'status_desc')
            return { status: 'desc' };
        return { createdAt: 'desc' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map