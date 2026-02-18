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
    transactions(storeId) {
        return this.prisma.paymentTransaction.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map