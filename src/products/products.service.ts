import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
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
      productName?: string;
      title?: string;
      shortDescription?: string;
      description?: string;
      longDescription?: string;
      seoTitle?: string;
      seoMetaDescription?: string;
      sku?: string;
      imageUrl?: string;
      images?: string[];
      categoryId?: string;
      suggestedPrice?: number;
      discountedPrice?: number;
      price?: number;
      stock?: number;
      status?: string;
      reviewsEnabled?: boolean;
      stockTrackingEnabled?: boolean;
      discountEndsAt?: string;
      tags?: string[];
      features?: string[];
      actionItems?: string[];
    },
    actor: { id: string; role: Role },
  ) {
    const writeData = this.toCreateData(storeId, data);
    const product = await this.prisma.product.create({
      data: writeData,
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
      productName?: string;
      title?: string;
      shortDescription?: string;
      description?: string;
      longDescription?: string;
      seoTitle?: string;
      seoMetaDescription?: string;
      sku?: string;
      imageUrl?: string;
      images?: string[];
      categoryId?: string;
      suggestedPrice?: number;
      discountedPrice?: number;
      price?: number;
      stock?: number;
      status?: string;
      reviewsEnabled?: boolean;
      stockTrackingEnabled?: boolean;
      discountEndsAt?: string;
      tags?: string[];
      features?: string[];
      actionItems?: string[];
    },
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
    });
    if (!existing) throw new NotFoundException('Product not found');

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: this.toUpdateData(data),
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

  async duplicate(
    storeId: string,
    productId: string,
    data: { title?: string; status?: string },
    actor: { id: string; role: Role },
  ) {
    const source = await this.prisma.product.findFirst({
      where: { id: productId, storeId },
      include: { variants: true },
    });
    if (!source) throw new NotFoundException('Product not found');

    const duplicated = await this.prisma.$transaction(async (tx) => {
      const cloned = await tx.product.create({
        data: {
          storeId: source.storeId,
          title:
            data.title?.trim() && data.title.trim().length
              ? data.title.trim()
              : `${source.title} Copy`,
          description: source.description,
          longDescription: source.longDescription,
          seoTitle: source.seoTitle,
          seoMetaDescription: source.seoMetaDescription,
          sku: source.sku,
          imageUrl: source.imageUrl,
          imagesJson: source.imagesJson as Prisma.InputJsonValue | undefined,
          categoryId: source.categoryId,
          price: source.price,
          suggestedPrice: source.suggestedPrice,
          discountedPrice: source.discountedPrice,
          stock: source.stock,
          status: data.status?.trim() || 'draft',
          reviewsEnabled: source.reviewsEnabled,
          stockTrackingEnabled: source.stockTrackingEnabled,
          discountEndsAt: source.discountEndsAt,
          tagsJson: source.tagsJson as Prisma.InputJsonValue | undefined,
          featuresJson: source.featuresJson as Prisma.InputJsonValue | undefined,
          actionItemsJson:
            source.actionItemsJson as Prisma.InputJsonValue | undefined,
        },
      });

      if (source.variants.length) {
        await tx.productVariant.createMany({
          data: source.variants.map((variant) => ({
            productId: cloned.id,
            optionName: variant.optionName,
            optionValue: variant.optionValue,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: cloned.id },
        include: { variants: true },
      });
    });

    if (!duplicated) {
      throw new NotFoundException('Duplicated product not found');
    }

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'product.duplicate',
      entityType: 'Product',
      entityId: duplicated.id,
      metaJson: {
        storeId,
        sourceProductId: source.id,
      },
    });

    return duplicated;
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

  private toCreateData(
    storeId: string,
    data: {
      productName?: string;
      title?: string;
      shortDescription?: string;
      description?: string;
      longDescription?: string;
      seoTitle?: string;
      seoMetaDescription?: string;
      sku?: string;
      imageUrl?: string;
      images?: string[];
      categoryId?: string;
      suggestedPrice?: number;
      discountedPrice?: number;
      price?: number;
      stock?: number;
      status?: string;
      reviewsEnabled?: boolean;
      stockTrackingEnabled?: boolean;
      discountEndsAt?: string;
      tags?: string[];
      features?: string[];
      actionItems?: string[];
    },
  ): Prisma.ProductUncheckedCreateInput {
    const title = data.title?.trim() || data.productName?.trim();
    if (!title) {
      throw new BadRequestException('title or productName is required');
    }

    const priceCandidate = data.price ?? data.suggestedPrice;
    if (priceCandidate == null || Number.isNaN(priceCandidate)) {
      throw new BadRequestException('price or suggestedPrice is required');
    }

    return {
      storeId,
      title,
      description: data.description ?? data.shortDescription,
      longDescription: data.longDescription,
      seoTitle: data.seoTitle,
      seoMetaDescription: data.seoMetaDescription,
      sku: data.sku,
      imageUrl:
        data.imageUrl ?? (Array.isArray(data.images) ? data.images[0] : undefined),
      imagesJson:
        Array.isArray(data.images) && data.images.length
          ? (data.images as Prisma.InputJsonValue)
          : undefined,
      categoryId: data.categoryId,
      price: priceCandidate,
      suggestedPrice: data.suggestedPrice ?? data.price,
      discountedPrice: data.discountedPrice,
      stock: data.stock ?? 0,
      status: data.status ?? 'draft',
      reviewsEnabled: data.reviewsEnabled ?? true,
      stockTrackingEnabled: data.stockTrackingEnabled ?? true,
      discountEndsAt: data.discountEndsAt
        ? new Date(data.discountEndsAt)
        : undefined,
      tagsJson:
        Array.isArray(data.tags) && data.tags.length
          ? (data.tags as Prisma.InputJsonValue)
          : undefined,
      featuresJson:
        Array.isArray(data.features) && data.features.length
          ? (data.features as Prisma.InputJsonValue)
          : undefined,
      actionItemsJson:
        Array.isArray(data.actionItems) && data.actionItems.length
          ? (data.actionItems as Prisma.InputJsonValue)
          : undefined,
    };
  }

  private toUpdateData(data: {
    productName?: string;
    title?: string;
    shortDescription?: string;
    description?: string;
    longDescription?: string;
    seoTitle?: string;
    seoMetaDescription?: string;
    sku?: string;
    imageUrl?: string;
    images?: string[];
    categoryId?: string;
    suggestedPrice?: number;
    discountedPrice?: number;
    price?: number;
    stock?: number;
    status?: string;
    reviewsEnabled?: boolean;
    stockTrackingEnabled?: boolean;
    discountEndsAt?: string;
    tags?: string[];
    features?: string[];
    actionItems?: string[];
  }): Prisma.ProductUncheckedUpdateInput {
    const next: Prisma.ProductUncheckedUpdateInput = {};

    const title = data.title?.trim() || data.productName?.trim();
    if (title) next.title = title;
    if (data.description !== undefined || data.shortDescription !== undefined) {
      next.description = data.description ?? data.shortDescription;
    }
    if (data.longDescription !== undefined) next.longDescription = data.longDescription;
    if (data.seoTitle !== undefined) next.seoTitle = data.seoTitle;
    if (data.seoMetaDescription !== undefined) {
      next.seoMetaDescription = data.seoMetaDescription;
    }
    if (data.sku !== undefined) next.sku = data.sku;
    if (data.imageUrl !== undefined) next.imageUrl = data.imageUrl;
    if (Array.isArray(data.images)) {
      next.imagesJson = data.images as Prisma.InputJsonValue;
      if (!data.imageUrl && data.images.length) {
        next.imageUrl = data.images[0];
      }
    }
    if (data.categoryId !== undefined) next.categoryId = data.categoryId;
    if (data.suggestedPrice !== undefined) next.suggestedPrice = data.suggestedPrice;
    if (data.discountedPrice !== undefined) next.discountedPrice = data.discountedPrice;
    if (data.price !== undefined) next.price = data.price;
    if (data.stock !== undefined) next.stock = data.stock;
    if (data.status !== undefined) next.status = data.status;
    if (data.reviewsEnabled !== undefined) next.reviewsEnabled = data.reviewsEnabled;
    if (data.stockTrackingEnabled !== undefined) {
      next.stockTrackingEnabled = data.stockTrackingEnabled;
    }
    if (data.discountEndsAt !== undefined) {
      next.discountEndsAt = data.discountEndsAt
        ? new Date(data.discountEndsAt)
        : null;
    }
    if (Array.isArray(data.tags)) {
      next.tagsJson = data.tags as Prisma.InputJsonValue;
    }
    if (Array.isArray(data.features)) {
      next.featuresJson = data.features as Prisma.InputJsonValue;
    }
    if (Array.isArray(data.actionItems)) {
      next.actionItemsJson = data.actionItems as Prisma.InputJsonValue;
    }

    return next;
  }
}
