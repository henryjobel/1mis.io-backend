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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const store_access_guard_1 = require("../common/guards/store-access.guard");
const billing_service_1 = require("./billing.service");
class RenewSubscriptionDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RenewSubscriptionDto.prototype, "planKey", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], RenewSubscriptionDto.prototype, "months", void 0);
class InitSslCommerzDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitSslCommerzDto.prototype, "planKey", void 0);
class CancelSubscriptionDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelSubscriptionDto.prototype, "reason", void 0);
class SubscriptionListQueryDto {
}
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SubscriptionListQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SubscriptionListQueryDto.prototype, "limit", void 0);
class SslCommerzSubscriptionWebhookDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SslCommerzSubscriptionWebhookDto.prototype, "invoiceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SslCommerzSubscriptionWebhookDto.prototype, "transactionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SslCommerzSubscriptionWebhookDto.prototype, "eventType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SslCommerzSubscriptionWebhookDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SslCommerzSubscriptionWebhookDto.prototype, "storeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SslCommerzSubscriptionWebhookDto.prototype, "amountBdt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SslCommerzSubscriptionWebhookDto.prototype, "payload", void 0);
let BillingController = class BillingController {
    constructor(billingService) {
        this.billingService = billingService;
    }
    plans() {
        return this.billingService.listPlans();
    }
    storeSubscription(storeId) {
        return this.billingService.storeSubscription(storeId);
    }
    storeSubscriptionInvoices(storeId, query) {
        return this.billingService.listSubscriptionInvoices(storeId, query);
    }
    storeSubscriptionEvents(storeId, query) {
        return this.billingService.listSubscriptionPaymentEvents(storeId, query);
    }
    renew(storeId, dto, user) {
        return this.billingService.renewSubscription(storeId, user, dto);
    }
    initSslCommerz(storeId, dto, user) {
        return this.billingService.initSslCommerz(storeId, user, dto);
    }
    cancelSubscription(storeId, dto, user) {
        return this.billingService.cancelSubscription(storeId, user, dto.reason);
    }
    sslCommerzSubscriptionWebhook(dto, secret, webhookToken) {
        return this.billingService.handleSslCommerzSubscriptionWebhook(dto, secret ?? webhookToken);
    }
    sslCommerzSubscriptionIpn(payload, secret, webhookToken) {
        return this.billingService.handleSslCommerzProviderCallback(payload, secret ?? webhookToken, {
            source: 'ipn',
        });
    }
    sslCommerzSubscriptionSuccessPost(payload, secret, webhookToken) {
        return this.billingService.handleSslCommerzProviderCallback(payload, secret ?? webhookToken, {
            forcedStatus: 'paid',
            source: 'success',
        });
    }
    async sslCommerzSubscriptionSuccessGet(payload, res, secret, webhookToken) {
        const result = (await this.billingService.handleSslCommerzProviderCallback(payload, secret ?? webhookToken, {
            forcedStatus: 'paid',
            source: 'success',
        }));
        return res.redirect(this.billingService.buildOwnerBillingRedirectUrl('success', payload, result));
    }
    sslCommerzSubscriptionFailPost(payload, secret, webhookToken) {
        return this.billingService.handleSslCommerzProviderCallback(payload, secret ?? webhookToken, {
            forcedStatus: 'failed',
            source: 'fail',
        });
    }
    async sslCommerzSubscriptionFailGet(payload, res, secret, webhookToken) {
        const result = (await this.billingService.handleSslCommerzProviderCallback(payload, secret ?? webhookToken, {
            forcedStatus: 'failed',
            source: 'fail',
        }));
        return res.redirect(this.billingService.buildOwnerBillingRedirectUrl('failed', payload, result));
    }
    sslCommerzSubscriptionCancelPost(payload, secret, webhookToken) {
        return this.billingService.handleSslCommerzProviderCallback(payload, secret ?? webhookToken, {
            forcedStatus: 'cancelled',
            source: 'cancel',
        });
    }
    async sslCommerzSubscriptionCancelGet(payload, res, secret, webhookToken) {
        const result = (await this.billingService.handleSslCommerzProviderCallback(payload, secret ?? webhookToken, {
            forcedStatus: 'cancelled',
            source: 'cancel',
        }));
        return res.redirect(this.billingService.buildOwnerBillingRedirectUrl('cancelled', payload, result));
    }
    sslCommerzSubscriptionMock(invoiceId, status) {
        const normalized = String(status ?? 'paid').trim().toLowerCase();
        if (normalized === 'failed') {
            return this.billingService.mockSslCommerzSubscriptionResult(invoiceId, 'failed');
        }
        if (normalized === 'cancelled') {
            return this.billingService.mockSslCommerzSubscriptionResult(invoiceId, 'cancelled');
        }
        return this.billingService.mockSslCommerzSubscriptionResult(invoiceId, 'paid');
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('api/plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "plans", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, store_access_guard_1.StoreAccessGuard),
    (0, common_1.Get)('api/stores/:id/subscription'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "storeSubscription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, store_access_guard_1.StoreAccessGuard),
    (0, common_1.Get)('api/stores/:id/subscription/invoices'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SubscriptionListQueryDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "storeSubscriptionInvoices", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, store_access_guard_1.StoreAccessGuard),
    (0, common_1.Get)('api/stores/:id/subscription/events'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SubscriptionListQueryDto]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "storeSubscriptionEvents", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, store_access_guard_1.StoreAccessGuard),
    (0, common_1.Post)('api/stores/:id/subscription/renew'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RenewSubscriptionDto, Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "renew", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, store_access_guard_1.StoreAccessGuard),
    (0, common_1.Post)('api/stores/:id/subscription/sslcommerz/init'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, InitSslCommerzDto, Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "initSslCommerz", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, store_access_guard_1.StoreAccessGuard),
    (0, common_1.Post)('api/stores/:id/subscription/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CancelSubscriptionDto, Object]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Post)('api/webhooks/sslcommerz/subscription'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-webhook-secret')),
    __param(2, (0, common_1.Query)('webhookToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SslCommerzSubscriptionWebhookDto, String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "sslCommerzSubscriptionWebhook", null);
__decorate([
    (0, common_1.Post)('api/webhooks/sslcommerz/subscription/ipn'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-webhook-secret')),
    __param(2, (0, common_1.Query)('webhookToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "sslCommerzSubscriptionIpn", null);
__decorate([
    (0, common_1.Post)('api/webhooks/sslcommerz/subscription/success'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-webhook-secret')),
    __param(2, (0, common_1.Query)('webhookToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "sslCommerzSubscriptionSuccessPost", null);
__decorate([
    (0, common_1.Get)('api/webhooks/sslcommerz/subscription/success'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Headers)('x-webhook-secret')),
    __param(3, (0, common_1.Query)('webhookToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "sslCommerzSubscriptionSuccessGet", null);
__decorate([
    (0, common_1.Post)('api/webhooks/sslcommerz/subscription/fail'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-webhook-secret')),
    __param(2, (0, common_1.Query)('webhookToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "sslCommerzSubscriptionFailPost", null);
__decorate([
    (0, common_1.Get)('api/webhooks/sslcommerz/subscription/fail'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Headers)('x-webhook-secret')),
    __param(3, (0, common_1.Query)('webhookToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "sslCommerzSubscriptionFailGet", null);
__decorate([
    (0, common_1.Post)('api/webhooks/sslcommerz/subscription/cancel'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-webhook-secret')),
    __param(2, (0, common_1.Query)('webhookToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "sslCommerzSubscriptionCancelPost", null);
__decorate([
    (0, common_1.Get)('api/webhooks/sslcommerz/subscription/cancel'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Headers)('x-webhook-secret')),
    __param(3, (0, common_1.Query)('webhookToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "sslCommerzSubscriptionCancelGet", null);
__decorate([
    (0, common_1.Get)('api/webhooks/sslcommerz/subscription/mock/:invoiceId'),
    __param(0, (0, common_1.Param)('invoiceId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BillingController.prototype, "sslCommerzSubscriptionMock", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map