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
    async logs(storeId, options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
        const where = {
            storeId,
            ...(options?.status ? { status: options.status } : {}),
            ...(options?.q
                ? {
                    OR: [
                        { channel: { contains: options.q, mode: 'insensitive' } },
                        { recipient: { contains: options.q, mode: 'insensitive' } },
                        { templateKey: { contains: options.q, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(options?.from || options?.to
                ? {
                    createdAt: {
                        ...(options?.from ? { gte: new Date(options.from) } : {}),
                        ...(options?.to ? { lte: new Date(options.to) } : {}),
                    },
                }
                : {}),
        };
        const skip = (page - 1) * limit;
        const orderBy = this.logSort(options?.sort);
        const [items, total] = await Promise.all([
            this.prisma.notificationLog.findMany({
                where,
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.notificationLog.count({ where }),
        ]);
        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    logSort(sort) {
        const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
        if (key === 'createdat_asc')
            return { createdAt: 'asc' };
        if (key === 'status_asc')
            return { status: 'asc' };
        if (key === 'status_desc')
            return { status: 'desc' };
        if (key === 'channel_asc')
            return { channel: 'asc' };
        if (key === 'channel_desc')
            return { channel: 'desc' };
        return { createdAt: 'desc' };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map