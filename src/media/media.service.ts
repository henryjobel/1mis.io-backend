import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  list(storeId: string) {
    return this.prisma.mediaAsset.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
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
}
