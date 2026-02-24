import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async requestExport(
    storeId: string,
    note: string | undefined,
    actor: { id: string; role: Role },
  ) {
    const requestId = `GDPR-${randomUUID()}`;
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
        valueJson: payload as Prisma.InputJsonValue,
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

  async requestDelete(
    storeId: string,
    note: string | undefined,
    actor: { id: string; role: Role },
  ) {
    const requestId = `GDPR-${randomUUID()}`;
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
        valueJson: payload as Prisma.InputJsonValue,
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

  async requests(storeId: string, page = 1, limit = 20) {
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
        result: this.asRecord(payload.result as Prisma.JsonValue | undefined),
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

  private asRecord(
    value: Prisma.JsonValue | null | undefined,
  ): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private asString(value: unknown, fallback: string) {
    if (typeof value !== 'string') return fallback;
    const next = value.trim();
    return next || fallback;
  }
}

