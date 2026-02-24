import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import { createHmac, randomUUID } from 'crypto';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  list(storeId: string) {
    return this.prisma.mediaAsset.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUploadSession(
    storeId: string,
    data: {
      type: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
      altText?: string;
    },
    actor: { id: string; role: Role },
  ) {
    const normalizedMimeType = data.mimeType.trim().toLowerCase();
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(normalizedMimeType)) {
      throw new BadRequestException(
        `Unsupported file type. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`,
      );
    }
    if (data.sizeBytes > MAX_IMAGE_BYTES) {
      throw new BadRequestException(
        `File exceeds max size of ${MAX_IMAGE_BYTES} bytes`,
      );
    }

    const uploadId = randomUUID();
    const key = this.buildAssetKey(storeId, data.filename);
    const uploadBaseUrl =
      this.configService.get<string>('MEDIA_UPLOAD_BASE_URL') ??
      'https://uploads.example.com';
    const publicBaseUrl =
      this.configService.get<string>('MEDIA_PUBLIC_BASE_URL') ??
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
        valueJson: sessionPayload as Prisma.InputJsonValue,
      },
      update: {
        valueJson: sessionPayload as Prisma.InputJsonValue,
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

  async uploadStatus(storeId: string, uploadId: string) {
    const key = `media_upload:${storeId}:${uploadId}`;
    const row = await this.prisma.platformSetting.findUnique({
      where: { key },
    });
    if (!row) throw new NotFoundException('Upload session not found');

    const payload = this.readUploadSession(row.valueJson);
    const now = new Date();
    const expired =
      payload.status === 'pending' &&
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

  async upload(
    storeId: string,
    data: { type: string; url: string; altText?: string },
    actor: { id: string; role: Role },
  ) {
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

  async completeUpload(
    storeId: string,
    data: { uploadId: string; url?: string; altText?: string },
    actor: { id: string; role: Role },
  ) {
    const settingKey = `media_upload:${storeId}:${data.uploadId}`;
    const row = await this.prisma.platformSetting.findUnique({
      where: { key: settingKey },
    });
    if (!row) throw new NotFoundException('Upload session not found');

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
      throw new BadRequestException('Upload session expired');
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
          } as Prisma.InputJsonValue,
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

  async remove(
    storeId: string,
    assetId: string,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.mediaAsset.findFirst({
      where: { id: assetId, storeId },
    });
    if (!existing) throw new NotFoundException('Media asset not found');

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

  private buildAssetKey(storeId: string, filename: string) {
    const sanitized = filename
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const safeFilename = sanitized || 'file';
    return `stores/${storeId}/${Date.now()}-${safeFilename}`;
  }

  private trimTrailingSlash(value: string) {
    return value.endsWith('/') ? value.slice(0, -1) : value;
  }

  private buildThumbnailUrl(publicUrl: string) {
    return `${publicUrl}?w=320&fit=cover&auto=format`;
  }

  private buildUploadSignature(input: {
    uploadId: string;
    key: string;
    mimeType: string;
    sizeBytes: number;
    expiresAtIso: string;
  }) {
    const secret =
      this.configService.get<string>('MEDIA_UPLOAD_SIGNING_KEY') ??
      'dev-media-signing-key';
    const payload = [
      input.uploadId,
      input.key,
      input.mimeType,
      input.sizeBytes,
      input.expiresAtIso,
    ].join('|');
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  private readUploadSession(value: Prisma.JsonValue) {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      !('url' in value)
    ) {
      throw new BadRequestException('Upload session payload is invalid');
    }
    const payload = value as {
      type?: unknown;
      key?: unknown;
      url?: unknown;
      thumbnailUrl?: unknown;
      altText?: unknown;
      mimeType?: unknown;
      sizeBytes?: unknown;
      status?: unknown;
      signature?: unknown;
      assetId?: unknown;
      createdAt?: unknown;
      completedAt?: unknown;
      expiresAt?: unknown;
    };
    if (!payload.url || typeof payload.url !== 'string') {
      throw new BadRequestException('Upload session URL is invalid');
    }
    return {
      type: typeof payload.type === 'string' ? payload.type : null,
      key: typeof payload.key === 'string' ? payload.key : '',
      url: payload.url,
      thumbnailUrl:
        typeof payload.thumbnailUrl === 'string' ? payload.thumbnailUrl : null,
      altText: typeof payload.altText === 'string' ? payload.altText : null,
      mimeType: typeof payload.mimeType === 'string' ? payload.mimeType : null,
      sizeBytes:
        typeof payload.sizeBytes === 'number' ? payload.sizeBytes : undefined,
      status:
        payload.status === 'completed' ||
        payload.status === 'failed' ||
        payload.status === 'expired'
          ? payload.status
          : 'pending',
      signature:
        typeof payload.signature === 'string' ? payload.signature : undefined,
      assetId: typeof payload.assetId === 'string' ? payload.assetId : null,
      createdAt: typeof payload.createdAt === 'string' ? payload.createdAt : null,
      completedAt:
        typeof payload.completedAt === 'string' ? payload.completedAt : null,
      expiresAt:
        typeof payload.expiresAt === 'string' ? payload.expiresAt : undefined,
    };
  }
}
