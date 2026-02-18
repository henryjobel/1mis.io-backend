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
exports.ShippingController = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const store_access_guard_1 = require("../common/guards/store-access.guard");
const shipping_service_1 = require("./shipping.service");
class ShippingRateDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingRateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShippingRateDto.prototype, "country", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ShippingRateDto.prototype, "amount", void 0);
class ShippingConfigDto {
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ShippingRateDto),
    __metadata("design:type", Array)
], ShippingConfigDto.prototype, "rates", void 0);
class ShipOrderDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShipOrderDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShipOrderDto.prototype, "courier", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShipOrderDto.prototype, "trackingNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShipOrderDto.prototype, "trackingUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ShipOrderDto.prototype, "estimatedDelivery", void 0);
class TrackingStatusDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TrackingStatusDto.prototype, "status", void 0);
let ShippingController = class ShippingController {
    constructor(shippingService) {
        this.shippingService = shippingService;
    }
    config(storeId) {
        return this.shippingService.getConfig(storeId);
    }
    upsertConfig(storeId, dto, user) {
        return this.shippingService.upsertConfig(storeId, dto, user);
    }
    shipOrder(storeId, dto, user) {
        return this.shippingService.shipOrder(storeId, dto, user);
    }
    updateTracking(storeId, shipmentId, dto, user) {
        return this.shippingService.updateTracking(storeId, shipmentId, dto.status, user);
    }
    shipments(storeId) {
        return this.shippingService.shipments(storeId);
    }
};
exports.ShippingController = ShippingController;
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "config", null);
__decorate([
    (0, common_1.Patch)('config'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ShippingConfigDto, Object]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "upsertConfig", null);
__decorate([
    (0, common_1.Post)('ship'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ShipOrderDto, Object]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "shipOrder", null);
__decorate([
    (0, common_1.Patch)('tracking/:shipmentId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('shipmentId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, TrackingStatusDto, Object]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "updateTracking", null);
__decorate([
    (0, common_1.Get)('shipments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ShippingController.prototype, "shipments", null);
exports.ShippingController = ShippingController = __decorate([
    (0, common_1.Controller)('api/stores/:id/shipping'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, store_access_guard_1.StoreAccessGuard),
    __metadata("design:paramtypes", [shipping_service_1.ShippingService])
], ShippingController);
//# sourceMappingURL=shipping.controller.js.map