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
    data: {
      title: string;
      description?: string;
      sku?: string;
      imageUrl?: string;
      categoryId?: string;
      price: number;
      stock?: number;
    },
    actor: { id: string; role: Role },
  ) {
    const product = await this.prisma.product.create({
      data: {
        storeId,
        title: data.title,
        description: data.description,
        sku: data.sku,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
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
    return this.prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(storeId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    storeId: string,
    productId: string,
    data: {
      title?: string;
      description?: string;
      sku?: string;
      imageUrl?: string;
      categoryId?: string;
      price?: number;
      stock?: number;
      status?: string;
    },
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
    });
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

  async delete(
    storeId: string,
    productId: string,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
    });
    if (!existing) throw new NotFoundException('Product not found');

    const deleted = await this.prisma.product.delete({
      where: { id: productId },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'product.delete',
      entityType: 'Product',
      entityId: productId,
    });

    return deleted;
  }

  async createVariant(
    storeId: string,
    productId: string,
    data: {
      optionName: string;
      optionValue: string;
      sku?: string;
      price?: number;
      stock?: number;
    },
    actor: { id: string; role: Role },
  ) {
    await this.assertProductInStore(storeId, productId);
    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        optionName: data.optionName,
        optionValue: data.optionValue,
        sku: data.sku,
        price: data.price,
        stock: data.stock ?? 0,
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'product.variant.create',
      entityType: 'ProductVariant',
      entityId: variant.id,
      metaJson: { storeId, productId },
    });

    return variant;
  }

  async listVariants(storeId: string, productId: string) {
    await this.assertProductInStore(storeId, productId);
    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateVariant(
    storeId: string,
    productId: string,
    variantId: string,
    data: {
      optionName?: string;
      optionValue?: string;
      sku?: string;
      price?: number;
      stock?: number;
    },
    actor: { id: string; role: Role },
  ) {
    await this.assertProductInStore(storeId, productId);
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data,
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'product.variant.update',
      entityType: 'ProductVariant',
      entityId: variantId,
      metaJson: { storeId, productId },
    });

    return updated;
  }

  async deleteVariant(
    storeId: string,
    productId: string,
    variantId: string,
    actor: { id: string; role: Role },
  ) {
    await this.assertProductInStore(storeId, productId);
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    const deleted = await this.prisma.productVariant.delete({
      where: { id: variantId },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'product.variant.delete',
      entityType: 'ProductVariant',
      entityId: variantId,
      metaJson: { storeId, productId },
    });

    return deleted;
  }

  private async assertProductInStore(storeId: string, productId: string) {
    const existing = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Product not found');
  }
}
