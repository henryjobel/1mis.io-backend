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
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
let MediaService = class MediaService {
    constructor(prisma, configService, auditService) {
        this.prisma = prisma;
        this.configService = configService;
        this.auditService = auditService;
    }
    list(storeId) {
        return this.prisma.mediaAsset.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createUploadSession(storeId, data, actor) {
        const normalizedMimeType = data.mimeType.trim().toLowerCase();
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(normalizedMimeType)) {
            throw new common_1.BadRequestException(`Unsupported file type. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`);
        }
        if (data.sizeBytes > MAX_IMAGE_BYTES) {
            throw new common_1.BadRequestException(`File exceeds max size of ${MAX_IMAGE_BYTES} bytes`);
        }
        const uploadId = (0, crypto_1.randomUUID)();
        const key = this.buildAssetKey(storeId, data.filename);
        const uploadBaseUrl = this.configService.get('MEDIA_UPLOAD_BASE_URL') ??
            'https://uploads.example.com';
        const publicBaseUrl = this.configService.get('MEDIA_PUBLIC_BASE_URL') ??
            'https://cdn.example.com';
        const uploadUrl = `${this.trimTrailingSlash(uploadBaseUrl)}/${key}?uploadId=${uploadId}`;
        const publicUrl = `${this.trimTrailingSlash(publicBaseUrl)}/${key}`;
        const thumbnailUrl = this.buildThumbnailUrl(publicUrl);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const expiresAtIso = expiresAt.toISOString();
        const settingKey = `media_upload:${storeId}:${uploadId}`;
        const signature = this.buildUploadSignature({
            uploadId,
            key,
            mimeType: normalizedMimeType,
            sizeBytes: data.sizeBytes,
            expiresAtIso,
        });
        const sessionPayload = {
            type: data.type,
            key,
            url: publicUrl,
            thumbnailUrl,
            altText: data.altText ?? null,
            mimeType: normalizedMimeType,
            sizeBytes: data.sizeBytes,
            expiresAt: expiresAtIso,
            status: 'pending',
            signature,
            assetId: null,
            completedAt: null,
            createdAt: new Date().toISOString(),
        };
        await this.prisma.platformSetting.upsert({
            where: { key: settingKey },
            create: {
                key: settingKey,
                valueJson: sessionPayload,
            },
            update: {
                valueJson: sessionPayload,
            },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'media.upload.presign',
            entityType: 'PlatformSetting',
            entityId: settingKey,
            metaJson: {
                storeId,
                mimeType: normalizedMimeType,
                sizeBytes: data.sizeBytes,
            },
        });
        return {
            uploadId,
            key,
            method: 'PUT',
            uploadUrl,
            publicUrl,
            thumbnailUrl,
            expiresAt: expiresAtIso,
            signature,
            headers: {
                'content-type': normalizedMimeType,
            },
            statusUrl: `/api/stores/${storeId}/media/uploads/${uploadId}/status`,
            constraints: {
                maxSizeBytes: MAX_IMAGE_BYTES,
                allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
            },
        };
    }
    async uploadStatus(storeId, uploadId) {
        const key = `media_upload:${storeId}:${uploadId}`;
        const row = await this.prisma.platformSetting.findUnique({
            where: { key },
        });
        if (!row)
            throw new common_1.NotFoundException('Upload session not found');
        const payload = this.readUploadSession(row.valueJson);
        const now = new Date();
        const expired = payload.status === 'pending' &&
            payload.expiresAt &&
            new Date(payload.expiresAt) <= now;
        const status = expired ? 'expired' : payload.status;
        return {
            uploadId,
            status,
            key: payload.key,
            mimeType: payload.mimeType,
            sizeBytes: payload.sizeBytes,
            url: payload.url,
            thumbnailUrl: payload.thumbnailUrl,
            assetId: payload.assetId,
            createdAt: payload.createdAt,
            completedAt: payload.completedAt,
            expiresAt: payload.expiresAt ?? null,
        };
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
    async completeUpload(storeId, data, actor) {
        const settingKey = `media_upload:${storeId}:${data.uploadId}`;
        const row = await this.prisma.platformSetting.findUnique({
            where: { key: settingKey },
        });
        if (!row)
            throw new common_1.NotFoundException('Upload session not found');
        const payload = this.readUploadSession(row.valueJson);
        if (payload.status === 'completed' && payload.assetId) {
            const existingAsset = await this.prisma.mediaAsset.findFirst({
                where: { id: payload.assetId, storeId },
            });
            if (existingAsset) {
                return existingAsset;
            }
        }
        const now = new Date();
        if (payload.expiresAt && new Date(payload.expiresAt) <= now) {
            throw new common_1.BadRequestException('Upload session expired');
        }
        const finalUrl = data.url?.trim() || payload.url;
        const completedAt = new Date().toISOString();
        const mergedAltText = data.altText ?? payload.altText;
        const asset = await this.prisma.$transaction(async (tx) => {
            const created = await tx.mediaAsset.create({
                data: {
                    storeId,
                    type: payload.type ?? 'image',
                    url: finalUrl,
                    altText: mergedAltText,
                },
            });
            await tx.platformSetting.update({
                where: { key: settingKey },
                data: {
                    valueJson: {
                        ...payload,
                        status: 'completed',
                        url: finalUrl,
                        altText: mergedAltText ?? null,
                        assetId: created.id,
                        completedAt,
                    },
                },
            });
            return created;
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'media.upload.complete',
            entityType: 'MediaAsset',
            entityId: asset.id,
            metaJson: {
                storeId,
                uploadId: data.uploadId,
            },
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
    buildAssetKey(storeId, filename) {
        const sanitized = filename
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9.\-_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        const safeFilename = sanitized || 'file';
        return `stores/${storeId}/${Date.now()}-${safeFilename}`;
    }
    trimTrailingSlash(value) {
        return value.endsWith('/') ? value.slice(0, -1) : value;
    }
    buildThumbnailUrl(publicUrl) {
        return `${publicUrl}?w=320&fit=cover&auto=format`;
    }
    buildUploadSignature(input) {
        const secret = this.configService.get('MEDIA_UPLOAD_SIGNING_KEY') ??
            'dev-media-signing-key';
        const payload = [
            input.uploadId,
            input.key,
            input.mimeType,
            input.sizeBytes,
            input.expiresAtIso,
        ].join('|');
        return (0, crypto_1.createHmac)('sha256', secret).update(payload).digest('hex');
    }
    readUploadSession(value) {
        if (!value ||
            typeof value !== 'object' ||
            Array.isArray(value) ||
            !('url' in value)) {
            throw new common_1.BadRequestException('Upload session payload is invalid');
        }
        const payload = value;
        if (!payload.url || typeof payload.url !== 'string') {
            throw new common_1.BadRequestException('Upload session URL is invalid');
        }
        return {
            type: typeof payload.type === 'string' ? payload.type : null,
            key: typeof payload.key === 'string' ? payload.key : '',
            url: payload.url,
            thumbnailUrl: typeof payload.thumbnailUrl === 'string' ? payload.thumbnailUrl : null,
            altText: typeof payload.altText === 'string' ? payload.altText : null,
            mimeType: typeof payload.mimeType === 'string' ? payload.mimeType : null,
            sizeBytes: typeof payload.sizeBytes === 'number' ? payload.sizeBytes : undefined,
            status: payload.status === 'completed' ||
                payload.status === 'failed' ||
                payload.status === 'expired'
                ? payload.status
                : 'pending',
            signature: typeof payload.signature === 'string' ? payload.signature : undefined,
            assetId: typeof payload.assetId === 'string' ? payload.assetId : null,
            createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : null,
            completedAt: typeof payload.completedAt === 'string' ? payload.completedAt : null,
            expiresAt: typeof payload.expiresAt === 'string' ? payload.expiresAt : undefined,
        };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        audit_service_1.AuditService])
], MediaService);
//# sourceMappingURL=media.service.js.map