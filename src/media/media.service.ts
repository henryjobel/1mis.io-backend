import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import { randomUUID } from 'crypto';
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
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const settingKey = `media_upload:${storeId}:${uploadId}`;

    await this.prisma.platformSetting.upsert({
      where: { key: settingKey },
      create: {
        key: settingKey,
        valueJson: {
          type: data.type,
          key,
          url: publicUrl,
          altText: data.altText ?? null,
          mimeType: normalizedMimeType,
          sizeBytes: data.sizeBytes,
          expiresAt: expiresAt.toISOString(),
        } as Prisma.InputJsonValue,
      },
      update: {
        valueJson: {
          type: data.type,
          key,
          url: publicUrl,
          altText: data.altText ?? null,
          mimeType: normalizedMimeType,
          sizeBytes: data.sizeBytes,
          expiresAt: expiresAt.toISOString(),
        } as Prisma.InputJsonValue,
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
      uploadUrl,
      publicUrl,
      expiresAt: expiresAt.toISOString(),
      constraints: {
        maxSizeBytes: MAX_IMAGE_BYTES,
        allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
      },
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
    const now = new Date();
    if (payload.expiresAt && new Date(payload.expiresAt) <= now) {
      throw new BadRequestException('Upload session expired');
    }

    const asset = await this.prisma.$transaction(async (tx) => {
      const created = await tx.mediaAsset.create({
        data: {
          storeId,
          type: payload.type ?? 'image',
          url: data.url?.trim() || payload.url,
          altText: data.altText ?? payload.altText,
        },
      });

      await tx.platformSetting.delete({
        where: { key: settingKey },
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
      url?: unknown;
      altText?: unknown;
      expiresAt?: unknown;
    };
    if (!payload.url || typeof payload.url !== 'string') {
      throw new BadRequestException('Upload session URL is invalid');
    }
    return {
      type: typeof payload.type === 'string' ? payload.type : null,
      url: payload.url,
      altText: typeof payload.altText === 'string' ? payload.altText : null,
      expiresAt:
        typeof payload.expiresAt === 'string' ? payload.expiresAt : undefined,
    };
  }
}
