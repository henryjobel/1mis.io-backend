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
exports.StoresController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const store_access_guard_1 = require("../common/guards/store-access.guard");
const stores_service_1 = require("./stores.service");
class CreateStoreDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "themePreset", void 0);
class UpdateStoreDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStoreDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStoreDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStoreDto.prototype, "themePreset", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.StoreStatus),
    __metadata("design:type", String)
], UpdateStoreDto.prototype, "status", void 0);
class UpdateTrackingDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "pixelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "gtmId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrackingDto.prototype, "capiToken", void 0);
class UpdateThemeDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateThemeDto.prototype, "preset", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateThemeDto.prototype, "customJson", void 0);
class UpdateMarketingDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMarketingDto.prototype, "facebookPageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMarketingDto.prototype, "businessManagerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMarketingDto.prototype, "adAccountId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMarketingDto.prototype, "catalogId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMarketingDto.prototype, "productFeedUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMarketingDto.prototype, "metaPixelId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMarketingDto.prototype, "conversionApiToken", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMarketingDto.prototype, "gtmId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMarketingDto.prototype, "isDomainVerified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMarketingDto.prototype, "isShopConnected", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMarketingDto.prototype, "isPixelEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMarketingDto.prototype, "isCapiEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMarketingDto.prototype, "isGtmEnabled", void 0);
class UpdateContentDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateContentDto.prototype, "hero", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateContentDto.prototype, "navigation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateContentDto.prototype, "footer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateContentDto.prototype, "sections", void 0);
class ConnectDomainDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectDomainDto.prototype, "domain", void 0);
class BuyDomainDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BuyDomainDto.prototype, "domain", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BuyDomainDto.prototype, "autoConnect", void 0);
let StoresController = class StoresController {
    constructor(storesService) {
        this.storesService = storesService;
    }
    create(user, dto) {
        return this.storesService.create(user.id, dto);
    }
    list(user) {
        return this.storesService.list(user);
    }
    findOne(id) {
        return this.storesService.findOne(id);
    }
    update(id, dto, user) {
        return this.storesService.update(id, dto, user);
    }
    publish(id, user) {
        return this.storesService.publish(id, user);
    }
    updateTracking(id, dto, user) {
        return this.storesService.upsertTracking(id, dto, user);
    }
    updateTheme(id, dto, user) {
        return this.storesService.upsertTheme(id, dto, user);
    }
    getMarketing(id) {
        return this.storesService.getMarketing(id);
    }
    upsertMarketing(id, dto, user) {
        return this.storesService.upsertMarketing(id, dto, user);
    }
    getContent(id) {
        return this.storesService.getContent(id);
    }
    upsertContent(id, dto, user) {
        return this.storesService.upsertContent(id, dto, user);
    }
    connectDomain(id, dto, user) {
        return this.storesService.connectDomain(id, dto.domain, user);
    }
    verifyDomain(id, user) {
        return this.storesService.verifyDomain(id, user);
    }
    buyDomain(id, dto, user) {
        return this.storesService.buyDomain(id, dto, user);
    }
    refreshSsl(id, user) {
        return this.storesService.refreshSsl(id, user);
    }
};
exports.StoresController = StoresController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateStoreDto]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateStoreDto, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Post)(':id/publish'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "publish", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Patch)(':id/tracking'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTrackingDto, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "updateTracking", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Patch)(':id/theme'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateThemeDto, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "updateTheme", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Get)(':id/marketing'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "getMarketing", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Patch)(':id/marketing'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateMarketingDto, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "upsertMarketing", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Get)(':id/content'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "getContent", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Patch)(':id/content'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateContentDto, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "upsertContent", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Post)(':id/domain/connect'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ConnectDomainDto, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "connectDomain", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Post)(':id/domain/verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "verifyDomain", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Post)(':id/domain/buy'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, BuyDomainDto, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "buyDomain", null);
__decorate([
    (0, common_1.UseGuards)(store_access_guard_1.StoreAccessGuard),
    (0, common_1.Post)(':id/ssl/refresh'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "refreshSsl", null);
exports.StoresController = StoresController = __decorate([
    (0, common_1.Controller)('api/stores'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stores_service_1.StoresService])
], StoresController);
//# sourceMappingURL=stores.controller.js.map