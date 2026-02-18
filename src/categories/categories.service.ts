import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    storeId: string,
    data: { name: string; slug: string },
    actor: { id: string; role: Role },
  ) {
    const category = await this.prisma.category.create({
      data: {
        storeId,
        name: data.name,
        slug: data.slug,
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'category.create',
      entityType: 'Category',
      entityId: category.id,
      metaJson: { storeId },
    });

    return category;
  }

  list(storeId: string) {
    return this.prisma.category.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    storeId: string,
    categoryId: string,
    data: { name?: string; slug?: string },
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.category.findFirst({
      where: { id: categoryId, storeId },
    });
    if (!existing) throw new NotFoundException('Category not found');

    const updated = await this.prisma.category.update({
      where: { id: categoryId },
      data,
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'category.update',
      entityType: 'Category',
      entityId: categoryId,
      metaJson: { storeId },
    });

    return updated;
  }

  async remove(
    storeId: string,
    categoryId: string,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.category.findFirst({
      where: { id: categoryId, storeId },
    });
    if (!existing) throw new NotFoundException('Category not found');

    await this.prisma.product.updateMany({
      where: { categoryId },
      data: { categoryId: null },
    });
    const deleted = await this.prisma.category.delete({
      where: { id: categoryId },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'category.delete',
      entityType: 'Category',
      entityId: categoryId,
      metaJson: { storeId },
    });

    return deleted;
  }
}
