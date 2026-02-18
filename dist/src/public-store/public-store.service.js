"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicStoreService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicStoreService = class PublicStoreService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async meta(slug) {
        const store = await this.prisma.store.findFirst({
            where: { slug, status: 'active' },
            include: { trackingConfig: true, themeConfig: true },
        });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return store;
    }
    async products(slug, options) {
        const store = await this.getActiveStore(slug);
        const page = options?.page && options.page > 0 ? options.page : 1;
        const limit = options?.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;
        const skip = (page - 1) * limit;
        const where = {
            storeId: store.id,
            status: 'active',
            ...(options?.category ? { category: { slug: options.category } } : {}),
            ...(options?.q
                ? {
                    OR: [
                        { title: { contains: options.q, mode: 'insensitive' } },
                        { description: { contains: options.q, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(options?.minPrice != null || options?.maxPrice != null
                ? {
                    price: {
                        ...(options?.minPrice != null ? { gte: options.minPrice } : {}),
                        ...(options?.maxPrice != null ? { lte: options.maxPrice } : {}),
                    },
                }
                : {}),
        };
        const orderBy = options?.sort === 'price_asc'
            ? { price: 'asc' }
            : options?.sort === 'price_desc'
                ? { price: 'desc' }
                : options?.sort === 'popular'
                    ? { stock: 'desc' }
                    : { createdAt: 'desc' };
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: { category: true, variants: true },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
    async product(slug, productId) {
        const store = await this.getActiveStore(slug);
        const product = await this.prisma.product.findFirst({
            where: { id: productId, storeId: store.id, status: 'active' },
            include: {
                category: true,
                variants: true,
                reviews: {
                    where: { isApproved: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async categories(slug) {
        const store = await this.getActiveStore(slug);
        return this.prisma.category.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { products: true } } },
        });
    }
    async trending(slug) {
        const store = await this.getActiveStore(slug);
        return this.prisma.product.findMany({
            where: { storeId: store.id, status: 'active' },
            orderBy: [{ updatedAt: 'desc' }, { stock: 'desc' }],
            take: 8,
        });
    }
    async bestSelling(slug) {
        const store = await this.getActiveStore(slug);
        const rows = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            where: { order: { storeId: store.id } },
            _sum: { qty: true },
            orderBy: { _sum: { qty: 'desc' } },
            take: 8,
        });
        const ids = rows
            .map((row) => row.productId)
            .filter((id) => Boolean(id));
        if (!ids.length)
            return [];
        const products = await this.prisma.product.findMany({
            where: { id: { in: ids } },
        });
        const map = new Map(products.map((p) => [p.id, p]));
        return ids.map((id) => map.get(id)).filter(Boolean);
    }
    async reviews(slug, productId) {
        const store = await this.getActiveStore(slug);
        return this.prisma.productReview.findMany({
            where: {
                storeId: store.id,
                isApproved: true,
                ...(productId ? { productId } : {}),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createReview(slug, data) {
        const store = await this.getActiveStore(slug);
        const product = await this.prisma.product.findFirst({
            where: { id: data.productId, storeId: store.id },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return this.prisma.productReview.create({
            data: {
                storeId: store.id,
                productId: data.productId,
                rating: data.rating,
                customer: data.customer,
                title: data.title,
                comment: data.comment,
                isApproved: true,
            },
        });
    }
    async getCart(slug, sessionId) {
        const store = await this.getActiveStore(slug);
        if (!sessionId)
            throw new common_1.NotFoundException('sessionId is required');
        const cart = await this.prisma.cart.findFirst({
            where: { storeId: store.id, sessionId, status: 'active' },
            include: { items: { include: { product: true, variant: true } } },
            orderBy: { createdAt: 'desc' },
        });
        if (!cart) {
            return { id: null, storeId: store.id, sessionId, items: [], total: 0 };
        }
        const total = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.qty, 0);
        return { ...cart, total };
    }
    async addCartItem(slug, data) {
        const store = await this.getActiveStore(slug);
        const product = await this.prisma.product.findFirst({
            where: { id: data.productId, storeId: store.id, status: 'active' },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const cart = (await this.prisma.cart.findFirst({
            where: {
                storeId: store.id,
                sessionId: data.sessionId,
                status: 'active',
            },
        })) ??
            (await this.prisma.cart.create({
                data: { storeId: store.id, sessionId: data.sessionId },
            }));
        const unitPrice = data.variantId
            ? Number((await this.prisma.productVariant.findUnique({
                where: { id: data.variantId },
            }))?.price ?? product.price)
            : Number(product.price);
        const existing = await this.prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: data.productId,
                variantId: data.variantId ?? null,
            },
        });
        if (existing) {
            await this.prisma.cartItem.update({
                where: { id: existing.id },
                data: { qty: existing.qty + data.qty },
            });
        }
        else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: data.productId,
                    variantId: data.variantId,
                    qty: data.qty,
                    unitPrice,
                },
            });
        }
        return this.getCart(slug, data.sessionId);
    }
    async updateCartItem(slug, sessionId, itemId, qty) {
        const store = await this.getActiveStore(slug);
        const cart = await this.prisma.cart.findFirst({
            where: { storeId: store.id, sessionId, status: 'active' },
        });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        await this.prisma.cartItem.updateMany({
            where: { id: itemId, cartId: cart.id },
            data: { qty },
        });
        return this.getCart(slug, sessionId);
    }
    async deleteCartItem(slug, sessionId, itemId) {
        const store = await this.getActiveStore(slug);
        const cart = await this.prisma.cart.findFirst({
            where: { storeId: store.id, sessionId, status: 'active' },
        });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        await this.prisma.cartItem.deleteMany({
            where: { id: itemId, cartId: cart.id },
        });
        return this.getCart(slug, sessionId);
    }
    async checkout(slug, data) {
        const store = await this.getActiveStore(slug);
        const cart = await this.prisma.cart.findFirst({
            where: { storeId: store.id, sessionId: data.sessionId, status: 'active' },
            include: { items: { include: { product: true } } },
        });
        if (!cart || !cart.items.length)
            throw new common_1.NotFoundException('Cart is empty');
        const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.qty, 0);
        const discount = await this.computeCouponDiscount(store.id, subtotal, data.couponCode);
        const taxableBase = Math.max(0, subtotal - discount);
        const tax = await this.computeTax(store.id, taxableBase, data.shippingAddress);
        const shipping = 0;
        const total = Math.max(0, taxableBase + tax + shipping);
        const code = `ORD-${Date.now().toString(36).toUpperCase()}`;
        const order = await this.prisma.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    storeId: store.id,
                    code,
                    status: client_1.OrderStatus.pending,
                    total,
                    subtotal,
                    discountTotal: discount,
                    taxTotal: tax,
                    shippingTotal: shipping,
                    couponCode: data.couponCode,
                    customerName: data.customerName,
                    customerEmail: data.customerEmail,
                    customerPhone: data.customerPhone,
                    shippingAddress: data.shippingAddress,
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            productNameSnapshot: item.product.title,
                            qty: item.qty,
                            unitPrice: item.unitPrice,
                        })),
                    },
                },
                include: { items: true },
            });
            await tx.paymentTransaction.create({
                data: {
                    storeId: store.id,
                    orderId: created.id,
                    provider: 'manual',
                    amount: total,
                    currency: 'USD',
                    status: 'pending',
                    metadata: { source: 'public_checkout' },
                },
            });
            for (const item of cart.items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });
                if (product) {
                    await tx.product.update({
                        where: { id: product.id },
                        data: { stock: Math.max(0, product.stock - item.qty) },
                    });
                }
            }
            await tx.cart.update({
                where: { id: cart.id },
                data: { status: 'converted' },
            });
            if (data.couponCode) {
                await tx.coupon.updateMany({
                    where: {
                        storeId: store.id,
                        code: data.couponCode.toUpperCase(),
                        isActive: true,
                    },
                    data: { usedCount: { increment: 1 } },
                });
            }
            return created;
        });
        return order;
    }
    async computeCouponDiscount(storeId, subtotal, couponCode) {
        if (!couponCode)
            return 0;
        const coupon = await this.prisma.coupon.findFirst({
            where: {
                storeId,
                code: couponCode.toUpperCase(),
                isActive: true,
                OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
                AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }],
            },
        });
        if (!coupon)
            return 0;
        if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
            return 0;
        if (coupon.minOrderAmount != null &&
            subtotal < Number(coupon.minOrderAmount))
            return 0;
        const raw = coupon.type === 'percent'
            ? subtotal * (Number(coupon.value) / 100)
            : Number(coupon.value);
        const capped = coupon.maxDiscount != null
            ? Math.min(raw, Number(coupon.maxDiscount))
            : raw;
        return Math.max(0, Math.min(subtotal, capped));
    }
    async computeTax(storeId, taxableBase, shippingAddress) {
        if (taxableBase <= 0)
            return 0;
        const country = shippingAddress?.country?.toUpperCase();
        const region = shippingAddress?.region?.toUpperCase();
        const rules = await this.prisma.taxRule.findMany({
            where: { storeId, isActive: true },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        });
        const matched = rules.find((rule) => {
            const countryMatch = !rule.country || rule.country.toUpperCase() === country;
            const regionMatch = !rule.region || rule.region.toUpperCase() === region;
            return countryMatch && regionMatch;
        }) ?? rules.find((rule) => rule.isDefault);
        if (!matched)
            return 0;
        return taxableBase * Number(matched.rate);
    }
    async getActiveStore(slug) {
        const store = await this.prisma.store.findFirst({
            where: { slug, status: 'active' },
        });
        if (!store)
            throw new common_1.NotFoundException('Store not found');
        return store;
    }
};
exports.PublicStoreService = PublicStoreService;
exports.PublicStoreService = PublicStoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicStoreService);
//# sourceMappingURL=public-store.service.js.map