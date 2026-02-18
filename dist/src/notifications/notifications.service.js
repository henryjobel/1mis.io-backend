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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async send(storeId, data, actor) {
        const log = await this.prisma.notificationLog.create({
            data: {
                storeId,
                channel: data.channel,
                recipient: data.recipient,
                templateKey: data.templateKey,
                payload: data.payload,
                status: 'queued',
            },
        });
        const delivered = await this.prisma.notificationLog.update({
            where: { id: log.id },
            data: { status: 'sent' },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'notification.send',
            entityType: 'NotificationLog',
            entityId: log.id,
        });
        return delivered;
    }
    logs(storeId) {
        return this.prisma.notificationLog.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map