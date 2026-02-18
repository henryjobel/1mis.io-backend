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
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PromotionsService = class PromotionsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    listCoupons(storeId) {
        return this.prisma.coupon.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createCoupon(storeId, data, actor) {
        const coupon = await this.prisma.coupon.create({
            data: { storeId, ...data, code: data.code.toUpperCase() },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'coupon.create',
            entityType: 'Coupon',
            entityId: coupon.id,
        });
        return coupon;
    }
    async updateCoupon(storeId, couponId, data, actor) {
        const existing = await this.prisma.coupon.findFirst({
            where: { id: couponId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Coupon not found');
        const nextData = { ...data };
        if (typeof nextData.code === 'string')
            nextData.code = nextData.code.toUpperCase();
        const updated = await this.prisma.coupon.update({
            where: { id: couponId },
            data: nextData,
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'coupon.update',
            entityType: 'Coupon',
            entityId: couponId,
        });
        return updated;
    }
    async deleteCoupon(storeId, couponId, actor) {
        const existing = await this.prisma.coupon.findFirst({
            where: { id: couponId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Coupon not found');
        const deleted = await this.prisma.coupon.delete({
            where: { id: couponId },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'coupon.delete',
            entityType: 'Coupon',
            entityId: couponId,
        });
        return deleted;
    }
    listTaxRules(storeId) {
        return this.prisma.taxRule.findMany({
            where: { storeId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async createTaxRule(storeId, data, actor) {
        if (data.isDefault) {
            await this.prisma.taxRule.updateMany({
                where: { storeId },
                data: { isDefault: false },
            });
        }
        const taxRule = await this.prisma.taxRule.create({
            data: { storeId, ...data },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'tax_rule.create',
            entityType: 'TaxRule',
            entityId: taxRule.id,
        });
        return taxRule;
    }
    async updateTaxRule(storeId, taxRuleId, data, actor) {
        const existing = await this.prisma.taxRule.findFirst({
            where: { id: taxRuleId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Tax rule not found');
        if (data.isDefault === true) {
            await this.prisma.taxRule.updateMany({
                where: { storeId },
                data: { isDefault: false },
            });
        }
        const updated = await this.prisma.taxRule.update({
            where: { id: taxRuleId },
            data,
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'tax_rule.update',
            entityType: 'TaxRule',
            entityId: taxRuleId,
        });
        return updated;
    }
    async deleteTaxRule(storeId, taxRuleId, actor) {
        const existing = await this.prisma.taxRule.findFirst({
            where: { id: taxRuleId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Tax rule not found');
        const deleted = await this.prisma.taxRule.delete({
            where: { id: taxRuleId },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'tax_rule.delete',
            entityType: 'TaxRule',
            entityId: taxRuleId,
        });
        return deleted;
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map