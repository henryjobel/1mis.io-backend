import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(storeId: string, threshold = 5) {
    const safeThreshold = this.normalizeThreshold(threshold);
    const [products, variants] = await Promise.all([
      this.prisma.product.findMany({
        where: { storeId },
        select: {
          id: true,
          title: true,
          stock: true,
          price: true,
          status: true,
        },
      }),
      this.prisma.productVariant.findMany({
        where: { product: { storeId } },
        select: {
          id: true,
          productId: true,
          stock: true,
          price: true,
          product: {
            select: {
              title: true,
              price: true,
            },
          },
        },
      }),
    ]);

    const variantCountByProduct = new Map<string, number>();
    for (const row of variants) {
      variantCountByProduct.set(
        row.productId,
        (variantCountByProduct.get(row.productId) ?? 0) + 1,
      );
    }

    const activeProducts = products.filter((row) => row.status === 'active');
    const lowStockProducts = activeProducts.filter(
      (row) => row.stock <= safeThreshold,
    );
    const outOfStockProducts = activeProducts.filter((row) => row.stock <= 0);
    const lowStockVariants = variants.filter((row) => row.stock <= safeThreshold);
    const outOfStockVariants = variants.filter((row) => row.stock <= 0);

    const productsValue = activeProducts
      .filter((row) => !variantCountByProduct.has(row.id))
      .reduce((sum, row) => sum + Number(row.price) * row.stock, 0);
    const variantsValue = variants.reduce((sum, row) => {
      const unit = row.price != null ? Number(row.price) : Number(row.product.price);
      return sum + unit * row.stock;
    }, 0);

    return {
      threshold: safeThreshold,
      products: {
        total: products.length,
        active: activeProducts.length,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
      },
      variants: {
        total: variants.length,
        lowStock: lowStockVariants.length,
        outOfStock: outOfStockVariants.length,
      },
      inventoryValueUsd: Number((productsValue + variantsValue).toFixed(2)),
    };
  }

  async lowStock(
    storeId: string,
    options?: { threshold?: number; includeVariants?: boolean },
  ) {
    const threshold = this.normalizeThreshold(options?.threshold);
    const includeVariants = options?.includeVariants ?? false;

    const products = await this.prisma.product.findMany({
      where: {
        storeId,
        stock: { lte: threshold },
      },
      orderBy: [{ stock: 'asc' }, { updatedAt: 'asc' }],
      select: {
        id: true,
        title: true,
        stock: true,
        status: true,
        sku: true,
        updatedAt: true,
      },
      take: 200,
    });

    const productAlerts = products.map((row) => ({
      type: 'product',
      id: row.id,
      name: row.title,
      sku: row.sku,
      stock: row.stock,
      threshold,
      level: this.stockLevel(row.stock, threshold),
      status: row.status,
      updatedAt: row.updatedAt.toISOString(),
    }));

    const variantAlerts = includeVariants
      ? (
          await this.prisma.productVariant.findMany({
            where: {
              stock: { lte: threshold },
              product: { storeId },
            },
            orderBy: [{ stock: 'asc' }, { updatedAt: 'asc' }],
            select: {
              id: true,
              optionName: true,
              optionValue: true,
              sku: true,
              stock: true,
              updatedAt: true,
              productId: true,
              product: { select: { title: true, status: true } },
            },
            take: 200,
          })
        ).map((row) => ({
          type: 'variant',
          id: row.id,
          productId: row.productId,
          productName: row.product.title,
          name: `${row.optionName}: ${row.optionValue}`,
          sku: row.sku,
          stock: row.stock,
          threshold,
          level: this.stockLevel(row.stock, threshold),
          status: row.product.status,
          updatedAt: row.updatedAt.toISOString(),
        }))
      : [];

    return {
      threshold,
      includeVariants,
      totalAlerts: productAlerts.length + variantAlerts.length,
      products: productAlerts,
      variants: variantAlerts,
    };
  }

  private normalizeThreshold(value?: number) {
    if (value == null || Number.isNaN(value)) return 5;
    return Math.max(0, Math.floor(value));
  }

  private stockLevel(stock: number, threshold: number) {
    if (stock <= 0) return 'out';
    if (stock <= Math.max(1, Math.floor(threshold / 2))) return 'critical';
    return 'low';
  }
}

