import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    storeId: string,
    data: { title: string; description?: string; sku?: string; price: number; stock?: number },
    actor: { id: string; role: Role },
  ) {
    const product = await this.prisma.product.create({
      data: {
        storeId,
        title: data.title,
        description: data.description,
        sku: data.sku,
        price: data.price,
        stock: data.stock ?? 0,
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'product.create',
      entityType: 'Product',
      entityId: product.id,
      metaJson: { storeId },
    });

    return product;
  }

  list(storeId: string) {
    return this.prisma.product.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' } });
  }

  async update(
    storeId: string,
    productId: string,
    data: { title?: string; description?: string; sku?: string; price?: number; stock?: number; status?: string },
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.product.findFirst({ where: { id: productId, storeId } });
    if (!existing) throw new NotFoundException('Product not found');

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data,
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'product.update',
      entityType: 'Product',
      entityId: productId,
    });

    return updated;
  }

  async delete(storeId: string, productId: string, actor: { id: string; role: Role }) {
    const existing = await this.prisma.product.findFirst({ where: { id: productId, storeId } });
    if (!existing) throw new NotFoundException('Product not found');

    const deleted = await this.prisma.product.delete({ where: { id: productId } });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'product.delete',
      entityType: 'Product',
      entityId: productId,
    });

    return deleted;
  }
}
