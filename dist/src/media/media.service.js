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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let MediaService = class MediaService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    list(storeId) {
        return this.prisma.mediaAsset.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async upload(storeId, data, actor) {
        const asset = await this.prisma.mediaAsset.create({
            data: { storeId, ...data },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'media.upload',
            entityType: 'MediaAsset',
            entityId: asset.id,
            metaJson: { storeId, type: data.type },
        });
        return asset;
    }
    async remove(storeId, assetId, actor) {
        const existing = await this.prisma.mediaAsset.findFirst({
            where: { id: assetId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Media asset not found');
        const deleted = await this.prisma.mediaAsset.delete({
            where: { id: assetId },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'media.delete',
            entityType: 'MediaAsset',
            entityId: assetId,
            metaJson: { storeId },
        });
        return deleted;
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], MediaService);
//# sourceMappingURL=media.service.js.map