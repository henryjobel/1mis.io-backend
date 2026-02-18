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
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        config_1.ConfigService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map