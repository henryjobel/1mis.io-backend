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
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const config_1 = require("@nestjs/config");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let WebhooksService = class WebhooksService {
    constructor(prisma, auditService, configService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.configService = configService;
    }
    async receive(channel, data, secret) {
        const configuredSecret = this.configService.get('WEBHOOK_SECRET');
        const valid = !configuredSecret || configuredSecret === secret;
        const key = `webhook:${channel}:${Date.now()}:${Math.random().toString(16).slice(2, 10)}`;
        await this.prisma.platformSetting.create({
            data: {
                key,
                valueJson: {
                    source: data.source,
                    storeId: data.storeId,
                    payload: data.payload,
                    receivedAt: new Date().toISOString(),
                    valid,
                },
            },
        });
        await this.auditService.log({
            role: client_1.Role.support,
            action: `webhook.${channel}.received`,
            entityType: 'PlatformSetting',
            entityId: key,
            metaJson: { valid, storeId: data.storeId },
        });
        return { accepted: valid };
    }
    async receivePayment(provider, data, secret) {
        const configuredSecret = this.configService.get('WEBHOOK_SECRET');
        const valid = !configuredSecret || configuredSecret === secret;
        const status = this.normalizeWebhookStatus(data.status ?? data.eventType);
        const payload = data.payload ?? {};
        const eventType = String(data.eventType ?? '').trim() || status;
        const baseKey = `webhook:${provider}:${Date.now()}:${Math.random().toString(16).slice(2, 10)}`;
        const targetTx = valid
            ? await this.findPaymentTransaction(provider, data)
            : null;
        let updatedTransactionId = null;
        let updatedOrderId = null;
        let processed = false;
        if (targetTx && status) {
            const nextMetadata = {
                ...targetTx.metadata,
                webhook: {
                    provider,
                    status,
                    eventType,
                    receivedAt: new Date().toISOString(),
                    payload,
                },
            };
            const updatedTx = await this.prisma.paymentTransaction.update({
                where: { id: targetTx.id },
                data: {
                    status,
                    providerRef: data.providerRef ?? targetTx.providerRef,
                    metadata: nextMetadata,
                },
            });
            updatedTransactionId = updatedTx.id;
            updatedOrderId = updatedTx.orderId;
            processed = true;
            if (updatedTx.orderId) {
                const orderStatus = this.toOrderStatus(status);
                if (orderStatus) {
                    await this.prisma.order.update({
                        where: { id: updatedTx.orderId },
                        data: { status: orderStatus },
                    });
                }
            }
        }
        await this.prisma.platformSetting.create({
            data: {
                key: baseKey,
                valueJson: {
                    provider,
                    valid,
                    processed,
                    eventType,
                    status,
                    storeId: data.storeId ?? targetTx?.storeId ?? null,
                    transactionId: updatedTransactionId,
                    orderId: updatedOrderId,
                    payload,
                    receivedAt: new Date().toISOString(),
                },
            },
        });
        await this.auditService.log({
            role: client_1.Role.support,
            action: `webhook.${provider}.received`,
            entityType: 'PlatformSetting',
            entityId: baseKey,
            metaJson: {
                valid,
                processed,
                transactionId: updatedTransactionId,
            },
        });
        return {
            accepted: valid,
            processed,
            provider,
            status,
            transactionId: updatedTransactionId,
            orderId: updatedOrderId,
        };
    }
    async findPaymentTransaction(provider, data) {
        if (data.transactionId) {
            return this.prisma.paymentTransaction.findFirst({
                where: {
                    id: data.transactionId,
                    provider,
                    ...(data.storeId ? { storeId: data.storeId } : {}),
                },
            });
        }
        if (data.providerRef) {
            return this.prisma.paymentTransaction.findFirst({
                where: {
                    providerRef: data.providerRef,
                    provider,
                    ...(data.storeId ? { storeId: data.storeId } : {}),
                },
            });
        }
        if (data.orderId) {
            return this.prisma.paymentTransaction.findFirst({
                where: {
                    orderId: data.orderId,
                    provider,
                    ...(data.storeId ? { storeId: data.storeId } : {}),
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        return null;
    }
    normalizeWebhookStatus(raw) {
        const value = String(raw ?? '').trim().toLowerCase();
        if (!value)
            return 'pending';
        if (value === 'succeeded' ||
            value === 'paid' ||
            value === 'success' ||
            value === 'completed' ||
            value === 'captured') {
            return 'succeeded';
        }
        if (value === 'processing' || value === 'requires_capture') {
            return 'processing';
        }
        if (value === 'failed' ||
            value === 'cancelled' ||
            value === 'canceled' ||
            value === 'declined' ||
            value === 'expired') {
            return 'failed';
        }
        if (value === 'refunded')
            return 'refunded';
        if (value === 'pending')
            return 'pending';
        return 'pending';
    }
    toOrderStatus(paymentStatus) {
        if (paymentStatus === 'succeeded')
            return client_1.OrderStatus.paid;
        if (paymentStatus === 'refunded')
            return client_1.OrderStatus.cancelled;
        if (paymentStatus === 'failed')
            return client_1.OrderStatus.cancelled;
        return null;
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        config_1.ConfigService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map