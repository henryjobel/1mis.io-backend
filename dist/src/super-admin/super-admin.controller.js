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
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
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
class CreateStoreDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "ownerEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['Starter', 'Growth', 'Scale']),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "plan", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "region", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['active', 'trial', 'suspended']),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "status", void 0);
class UpdateLifecycleDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLifecycleDto.prototype, "publishStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLifecycleDto.prototype, "domainStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLifecycleDto.prototype, "sslStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLifecycleDto.prototype, "notes", void 0);
class ThemeSyncDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], ThemeSyncDto.prototype, "at", void 0);
class InviteAdminDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InviteAdminDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], InviteAdminDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Role),
    __metadata("design:type", String)
], InviteAdminDto.prototype, "role", void 0);
class UpdatePaymentOpsDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePaymentOpsDto.prototype, "stripeEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePaymentOpsDto.prototype, "sslCommerzEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdatePaymentOpsDto.prototype, "codEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['test', 'live']),
    __metadata("design:type", String)
], UpdatePaymentOpsDto.prototype, "mode", void 0);
class UpdateTicketDto {
}
__decorate([
    (0, class_validator_1.IsIn)(['open', 'in_progress', 'resolved']),
    __metadata("design:type", String)
], UpdateTicketDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTicketDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['low', 'medium', 'high']),
    __metadata("design:type", String)
], UpdateTicketDto.prototype, "priority", void 0);
class CreateIncidentDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['info', 'warning', 'critical']),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['monitoring', 'resolved']),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "startedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "note", void 0);
class UpdateIncidentDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIncidentDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['info', 'warning', 'critical']),
    __metadata("design:type", String)
], UpdateIncidentDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['monitoring', 'resolved']),
    __metadata("design:type", String)
], UpdateIncidentDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIncidentDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIncidentDto.prototype, "resolutionNote", void 0);
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
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateFlagDto.prototype, "rolloutPct", void 0);
class UpdateSettingDto {
}
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateSettingDto.prototype, "valueJson", void 0);
class UpsertSettingsBatchDto {
}
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpsertSettingsBatchDto.prototype, "values", void 0);
class SubscriptionUpdateDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubscriptionUpdateDto.prototype, "plan", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['active', 'trial', 'past_due', 'cancelled']),
    __metadata("design:type", String)
], SubscriptionUpdateDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], SubscriptionUpdateDto.prototype, "nextBillingDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], SubscriptionUpdateDto.prototype, "expiryDate", void 0);
class UpdateAdminStatusDto {
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAdminStatusDto.prototype, "isActive", void 0);
class SetMaintenanceModeDto {
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetMaintenanceModeDto.prototype, "enabled", void 0);
class UpdateAiHardCapDto {
}
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateAiHardCapDto.prototype, "hardCapUsd", void 0);
class OverviewMetricsQueryDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], OverviewMetricsQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], OverviewMetricsQueryDto.prototype, "to", void 0);
class AuditLogQueryDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['dashboard']),
    __metadata("design:type", String)
], AuditLogQueryDto.prototype, "format", void 0);
let SuperAdminController = class SuperAdminController {
    constructor(superAdminService) {
        this.superAdminService = superAdminService;
    }
    overview() {
        return this.superAdminService.overview();
    }
    overviewMetrics(query) {
        return this.superAdminService.overviewMetrics(query.from, query.to);
    }
    stores() {
        return this.superAdminService.stores();
    }
    createStore(dto, user) {
        return this.superAdminService.createStore(dto, user);
    }
    updateStoreStatus(id, dto, user) {
        return this.superAdminService.updateStoreStatus(id, dto.status, user);
    }
    deleteStore(id, user) {
        return this.superAdminService.deleteStore(id, user);
    }
    lifecycle() {
        return this.superAdminService.lifecycle();
    }
    lifecycleByStore(storeId) {
        return this.superAdminService.lifecycleByStore(storeId);
    }
    updateLifecycle(storeId, dto, user) {
        return this.superAdminService.updateLifecycle(storeId, dto, user);
    }
    markThemeSynced(storeId, dto, user) {
        return this.superAdminService.markThemeSynced(storeId, dto.at, user);
    }
    admins() {
        return this.superAdminService.admins();
    }
    inviteAdmin(dto, user) {
        return this.superAdminService.inviteAdmin(dto, user);
    }
    updateAdminStatus(id, dto, user) {
        return this.superAdminService.updateAdminStatus(id, dto.isActive, user);
    }
    resetAdminPassword(id, user) {
        return this.superAdminService.resetAdminPassword(id, user);
    }
    resendAdminInvite(id, user) {
        return this.superAdminService.resendAdminInvite(id, user);
    }
    subscriptions() {
        return this.superAdminService.subscriptions();
    }
    syncSubscriptionPricing(user) {
        return this.superAdminService.syncSubscriptionPricing(user);
    }
    subscriptionByStore(storeId) {
        return this.superAdminService.subscriptionByStore(storeId);
    }
    updateSubscription(storeId, dto, user) {
        return this.superAdminService.updateSubscription(storeId, dto, user);
    }
    retrySubscription(storeId, user) {
        return this.superAdminService.retrySubscription(storeId, user);
    }
    cancelSubscription(storeId, user) {
        return this.superAdminService.cancelSubscription(storeId, user);
    }
    paymentOps() {
        return this.superAdminService.paymentOps();
    }
    paymentOpsMetrics() {
        return this.superAdminService.paymentOpsMetrics();
    }
    paymentOpsByStore(storeId) {
        return this.superAdminService.paymentOpsByStore(storeId);
    }
    updatePaymentOps(storeId, dto, user) {
        return this.superAdminService.updatePaymentOps(storeId, dto, user);
    }
    resetPaymentFailures(storeId, user) {
        return this.superAdminService.resetPaymentFailures(storeId, user);
    }
    tickets() {
        return this.superAdminService.tickets();
    }
    ticket(id) {
        return this.superAdminService.ticket(id);
    }
    updateTicket(id, dto, user) {
        return this.superAdminService.updateTicket(id, dto, user);
    }
    securityIncidents() {
        return this.superAdminService.securityIncidents();
    }
    securityIncident(id) {
        return this.superAdminService.securityIncident(id);
    }
    createSecurityIncident(dto, user) {
        return this.superAdminService.createSecurityIncident(dto, user);
    }
    updateSecurityIncident(id, dto, user) {
        return this.superAdminService.updateSecurityIncident(id, dto, user);
    }
    rotatePlatformKeys(user) {
        return this.superAdminService.rotatePlatformKeys(user);
    }
    health() {
        return this.superAdminService.health();
    }
    setMaintenanceMode(dto, user) {
        return this.superAdminService.setMaintenanceMode(dto.enabled, user);
    }
    restartService(service) {
        return this.superAdminService.restartService(service);
    }
    aiUsage() {
        return this.superAdminService.aiUsage();
    }
    updateAiHardCap(dto, user) {
        return this.superAdminService.updateAiHardCap(dto.hardCapUsd, user);
    }
    flags() {
        return this.superAdminService.flags();
    }
    upsertFlag(key, dto, user) {
        return this.superAdminService.upsertFlag(key, dto.enabled, dto.description, dto.rolloutPct, user);
    }
    auditLogs(query) {
        return this.superAdminService.auditLogs(query.format);
    }
    settings() {
        return this.superAdminService.settings();
    }
    upsertSetting(key, dto, user) {
        return this.superAdminService.upsertSetting(key, dto.valueJson, user);
    }
    upsertSettingsBatch(dto, user) {
        return this.superAdminService.upsertSettingsBatch(dto.values, user);
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
    (0, common_1.Get)('overview/metrics'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops, client_1.Role.finance),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [OverviewMetricsQueryDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "overviewMetrics", null);
__decorate([
    (0, common_1.Get)('stores'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops, client_1.Role.support),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "stores", null);
__decorate([
    (0, common_1.Post)('stores'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateStoreDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "createStore", null);
__decorate([
    (0, common_1.Patch)('stores/:id/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateStoreStatusDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateStoreStatus", null);
__decorate([
    (0, common_1.Delete)('stores/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "deleteStore", null);
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
    (0, common_1.Patch)('lifecycle/:storeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateLifecycleDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateLifecycle", null);
__decorate([
    (0, common_1.Post)('lifecycle/:storeId/theme-sync'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ThemeSyncDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "markThemeSynced", null);
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
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [InviteAdminDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "inviteAdmin", null);
__decorate([
    (0, common_1.Patch)('admins/:id/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateAdminStatusDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateAdminStatus", null);
__decorate([
    (0, common_1.Post)('admins/:id/reset-password'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "resetAdminPassword", null);
__decorate([
    (0, common_1.Post)('admins/:id/resend-invite'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "resendAdminInvite", null);
__decorate([
    (0, common_1.Get)('subscriptions'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "subscriptions", null);
__decorate([
    (0, common_1.Post)('subscriptions/sync-pricing'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "syncSubscriptionPricing", null);
__decorate([
    (0, common_1.Get)('subscriptions/:storeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "subscriptionByStore", null);
__decorate([
    (0, common_1.Patch)('subscriptions/:storeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SubscriptionUpdateDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Post)('subscriptions/:storeId/retry'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "retrySubscription", null);
__decorate([
    (0, common_1.Post)('subscriptions/:storeId/cancel'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Get)('payment-ops'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "paymentOps", null);
__decorate([
    (0, common_1.Get)('payment-ops/metrics'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance, client_1.Role.ops),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "paymentOpsMetrics", null);
__decorate([
    (0, common_1.Get)('payment-ops/:storeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "paymentOpsByStore", null);
__decorate([
    (0, common_1.Patch)('payment-ops/:storeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance, client_1.Role.ops),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdatePaymentOpsDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updatePaymentOps", null);
__decorate([
    (0, common_1.Post)('payment-ops/:storeId/reset-failures'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.finance, client_1.Role.ops),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "resetPaymentFailures", null);
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
    (0, common_1.Patch)('tickets/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.support, client_1.Role.ops),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTicketDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateTicket", null);
__decorate([
    (0, common_1.Get)('security/incidents'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "securityIncidents", null);
__decorate([
    (0, common_1.Get)('security/incidents/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "securityIncident", null);
__decorate([
    (0, common_1.Post)('security/incidents'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateIncidentDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "createSecurityIncident", null);
__decorate([
    (0, common_1.Patch)('security/incidents/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateIncidentDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateSecurityIncident", null);
__decorate([
    (0, common_1.Post)('security/rotate-keys'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "rotatePlatformKeys", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "health", null);
__decorate([
    (0, common_1.Post)('health/maintenance'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SetMaintenanceModeDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "setMaintenanceMode", null);
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
    (0, common_1.Patch)('ai-usage/hard-cap'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpdateAiHardCapDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateAiHardCap", null);
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
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateFlagDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "upsertFlag", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops, client_1.Role.finance, client_1.Role.support),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AuditLogQueryDto]),
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
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateSettingDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "upsertSetting", null);
__decorate([
    (0, common_1.Put)('settings'),
    (0, roles_decorator_1.Roles)(client_1.Role.super_admin, client_1.Role.ops),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UpsertSettingsBatchDto, Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "upsertSettingsBatch", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)('api/super-admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [super_admin_service_1.SuperAdminService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map