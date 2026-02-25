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
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ComplianceService = class ComplianceService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async requestExport(storeId, note, actor) {
        const requestId = `GDPR-${(0, crypto_1.randomUUID)()}`;
        const payload = {
            id: requestId,
            type: 'export',
            status: 'queued',
            storeId,
            note: note?.trim() || null,
            requestedBy: actor.id,
            requestedAt: new Date().toISOString(),
            result: {
                downloadUrl: `/api/stores/${storeId}/compliance/gdpr/exports/${requestId}`,
            },
        };
        const key = `gdpr_request:${storeId}:${requestId}`;
        await this.prisma.platformSetting.create({
            data: {
                key,
                valueJson: payload,
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'compliance.gdpr.export.request',
            entityType: 'PlatformSetting',
            entityId: key,
            metaJson: { storeId, requestId },
        });
        return payload;
    }
    async requestDelete(storeId, note, actor) {
        const requestId = `GDPR-${(0, crypto_1.randomUUID)()}`;
        const payload = {
            id: requestId,
            type: 'delete_request',
            status: 'requested',
            storeId,
            note: note?.trim() || null,
            requestedBy: actor.id,
            requestedAt: new Date().toISOString(),
        };
        const key = `gdpr_request:${storeId}:${requestId}`;
        await this.prisma.platformSetting.create({
            data: {
                key,
                valueJson: payload,
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'compliance.gdpr.delete_request',
            entityType: 'PlatformSetting',
            entityId: key,
            metaJson: { storeId, requestId },
        });
        return payload;
    }
    async requests(storeId, page = 1, limit = 20) {
        const safeLimit = Math.min(Math.max(limit, 1), 200);
        const safePage = Math.max(page, 1);
        const rows = await this.prisma.platformSetting.findMany({
            where: { key: { startsWith: `gdpr_request:${storeId}:` } },
            orderBy: { updatedAt: 'desc' },
        });
        const items = rows.map((row) => {
            const payload = this.asRecord(row.valueJson);
            return {
                id: this.asString(payload.id, row.key.replace(`gdpr_request:${storeId}:`, '')),
                type: this.asString(payload.type, 'unknown'),
                status: this.asString(payload.status, 'unknown'),
                note: this.asString(payload.note, ''),
                requestedBy: this.asString(payload.requestedBy, ''),
                requestedAt: this.asString(payload.requestedAt, row.updatedAt.toISOString()),
                result: this.asRecord(payload.result),
            };
        });
        const total = items.length;
        const totalPages = Math.max(1, Math.ceil(total / safeLimit));
        const offset = (safePage - 1) * safeLimit;
        const paged = items.slice(offset, offset + safeLimit);
        return {
            items: paged,
            page: safePage,
            limit: safeLimit,
            total,
            totalPages,
        };
    }
    asRecord(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return {};
        }
        return value;
    }
    asString(value, fallback) {
        if (typeof value !== 'string')
            return fallback;
        const next = value.trim();
        return next || fallback;
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map