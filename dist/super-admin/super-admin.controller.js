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
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const super_admin_service_1 = require("./super-admin.service");
class UpdateStoreStatusDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(client_1.StoreStatus),
    __metadata("design:type", String)
], UpdateStoreStatusDto.prototype, "status", void 0);
class InviteAdminDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InviteAdminDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InviteAdminDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Role),
    __metadata("design:type", String)
], InviteAdminDto.prototype, "role", void 0);
class UpdateFlagDto {
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateFlagDto.prototype, "enabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateFlagDto.prototype, "description", void 0);
class UpdateSettingDto {
}
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateSettingDto.prototype, "valueJson", void 0);
let SuperAdminController = class SuperAdminController {
    constructor(superAdminService) {
        this.superAdminService = superAdminService;
    }
    overview() {
        return this.superAdminService.overview();
    }
    stores() {
        return this.superAdminService.stores();
    }
    updateStoreStatus(id, dto) {
        return this.superAdminService.updateStoreStatus(id, dto.status);
    }
    lifecycle() {
        return this.superAdminService.lifecycle();
    }
    lifecycleByStore(storeId) {
        return this.superAdminService.lifecycleByStore(storeId);
    }
    admins() {
        return this.superAdminService.admins();
    }
    inviteAdmin(dto) {
        return this.superAdminService.inviteAdmin(dto);
    }
    subscriptions() {
        return this.superAdminService.subscriptions();
    }
    paymentOps() {
        return this.superAdminService.paymentOps();
    }
    paymentOpsByStore(storeId) {
        return this.superAdminService.paymentOpsByStore(storeId);
    }
    tickets() {
        return this.superAdminService.tickets();
    }
    ticket(id) {
        return this.superAdminService.ticket(id);
    }
    health() {
        return this.superAdminService.health();
    }
    restartService(service) {
        return this.superAdminService.restartService(service);
    }
    aiUsage() {
        return this.superAdminService.aiUsage();
    }
    flags() {
        return this.superAdminService.flags();
    }
    upsertFlag(key, dto) {
        return this.superAdminService.upsertFlag(key, dto.enabled, dto.description);
    }
    auditLogs() {
        return this.superAdminService.auditLogs();
    }
    settings() {
        return this.superAdminService.settings();
    }
    upsertSetting(key, dto) {
        return this.superAdminService.upsertSetting(key, dto.valueJson);
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('overview'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops, client_1.Role.finance),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('stores'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops, client_1.Role.support),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "stores", null);
__decorate([
    (0, common_1.Patch)('stores/:id/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateStoreStatusDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateStoreStatus", null);
__decorate([
    (0, common_1.Get)('lifecycle'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops, client_1.Role.support),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "lifecycle", null);
__decorate([
    (0, common_1.Get)('lifecycle/:storeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops, client_1.Role.support),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "lifecycleByStore", null);
__decorate([
    (0, common_1.Get)('admins'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "admins", null);
__decorate([
    (0, common_1.Post)('admins/invite'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [InviteAdminDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "inviteAdmin", null);
__decorate([
    (0, common_1.Get)('subscriptions'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "subscriptions", null);
__decorate([
    (0, common_1.Get)('payment-ops'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "paymentOps", null);
__decorate([
    (0, common_1.Get)('payment-ops/:storeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "paymentOpsByStore", null);
__decorate([
    (0, common_1.Get)('tickets'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.support),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "tickets", null);
__decorate([
    (0, common_1.Get)('tickets/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.support),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "ticket", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "health", null);
__decorate([
    (0, common_1.Post)('health/:service/restart'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Param)('service')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "restartService", null);
__decorate([
    (0, common_1.Get)('ai-usage'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "aiUsage", null);
__decorate([
    (0, common_1.Get)('flags'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "flags", null);
__decorate([
    (0, common_1.Patch)('flags/:key'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateFlagDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "upsertFlag", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops, client_1.Role.finance, client_1.Role.support),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "auditLogs", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "settings", null);
__decorate([
    (0, common_1.Patch)('settings/:key'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateSettingDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "upsertSetting", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)('api/super-admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [super_admin_service_1.SuperAdminService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map