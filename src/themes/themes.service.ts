import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThemesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  presets() {
    return [
      {
        key: 'minimal',
        name: 'Minimal',
        description: 'Clean launch-ready storefront',
      },
      {
        key: 'aurora',
        name: 'Aurora',
        description: 'Colorful premium conversion layout',
      },
      {
        key: 'mono',
        name: 'Mono Luxe',
        description: 'Bold typography focused checkout flow',
      },
      {
        key: 'spark',
        name: 'Spark Grid',
        description: 'High-density catalog experience',
      },
    ];
  }

  async storeTheme(storeId: string) {
    const theme = await this.prisma.themeConfig.findUnique({
      where: { storeId },
    });
    return {
      theme,
      presets: this.presets(),
    };
  }

  async apply(
    storeId: string,
    data: { preset: string; customJson?: Record<string, unknown> },
    actor: { id: string; role: Role },
  ) {
    const theme = await this.prisma.themeConfig.upsert({
      where: { storeId },
      create: {
        storeId,
        preset: data.preset,
        customJson: data.customJson as Prisma.InputJsonValue | undefined,
      },
      update: {
        preset: data.preset,
        customJson: data.customJson as Prisma.InputJsonValue | undefined,
      },
    });

    await this.prisma.store.update({
      where: { id: storeId },
      data: { themePreset: data.preset },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'theme.apply',
      entityType: 'ThemeConfig',
      entityId: theme.id,
      metaJson: { storeId, preset: data.preset },
    });

    return theme;
  }
}
