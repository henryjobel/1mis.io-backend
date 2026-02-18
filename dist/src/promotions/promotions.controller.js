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
exports.PromotionsController = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const store_access_guard_1 = require("../common/guards/store-access.guard");
const promotions_service_1 = require("./promotions.service");
class CouponDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CouponDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CouponDto.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CouponDto.prototype, "value", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CouponDto.prototype, "minOrderAmount", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CouponDto.prototype, "maxDiscount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CouponDto.prototype, "isActive", void 0);
class TaxRuleDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaxRuleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaxRuleDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaxRuleDto.prototype, "region", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TaxRuleDto.prototype, "rate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TaxRuleDto.prototype, "isDefault", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TaxRuleDto.prototype, "isActive", void 0);
let PromotionsController = class PromotionsController {
    constructor(promotionsService) {
        this.promotionsService = promotionsService;
    }
    coupons(storeId) {
        return this.promotionsService.listCoupons(storeId);
    }
    createCoupon(storeId, dto, user) {
        return this.promotionsService.createCoupon(storeId, dto, user);
    }
    updateCoupon(storeId, couponId, dto, user) {
        return this.promotionsService.updateCoupon(storeId, couponId, dto, user);
    }
    deleteCoupon(storeId, couponId, user) {
        return this.promotionsService.deleteCoupon(storeId, couponId, user);
    }
    taxRules(storeId) {
        return this.promotionsService.listTaxRules(storeId);
    }
    createTaxRule(storeId, dto, user) {
        return this.promotionsService.createTaxRule(storeId, dto, user);
    }
    updateTaxRule(storeId, taxRuleId, dto, user) {
        return this.promotionsService.updateTaxRule(storeId, taxRuleId, dto, user);
    }
    deleteTaxRule(storeId, taxRuleId, user) {
        return this.promotionsService.deleteTaxRule(storeId, taxRuleId, user);
    }
};
exports.PromotionsController = PromotionsController;
__decorate([
    (0, common_1.Get)('coupons'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "coupons", null);
__decorate([
    (0, common_1.Post)('coupons'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CouponDto, Object]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "createCoupon", null);
__decorate([
    (0, common_1.Patch)('coupons/:couponId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('couponId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "updateCoupon", null);
__decorate([
    (0, common_1.Delete)('coupons/:couponId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('couponId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "deleteCoupon", null);
__decorate([
    (0, common_1.Get)('tax-rules'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "taxRules", null);
__decorate([
    (0, common_1.Post)('tax-rules'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, TaxRuleDto, Object]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "createTaxRule", null);
__decorate([
    (0, common_1.Patch)('tax-rules/:taxRuleId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('taxRuleId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "updateTaxRule", null);
__decorate([
    (0, common_1.Delete)('tax-rules/:taxRuleId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('taxRuleId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "deleteTaxRule", null);
exports.PromotionsController = PromotionsController = __decorate([
    (0, common_1.Controller)('api/stores/:id/promotions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, store_access_guard_1.StoreAccessGuard),
    __metadata("design:paramtypes", [promotions_service_1.PromotionsService])
], PromotionsController);
//# sourceMappingURL=promotions.controller.js.map