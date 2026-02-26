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
        const [contentRow, domainRow] = await Promise.all([
            this.prisma.platformSetting.findUnique({
                where: { key: `store_content:${store.id}` },
            }),
            this.prisma.platformSetting.findUnique({
                where: { key: `domain:${store.id}` },
            }),
        ]);
        return {
            ...store,
            content: contentRow?.valueJson ?? {},
            domain: domainRow?.valueJson ?? {},
        };
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
        const reviewsEnabled = product
            .reviewsEnabled;
        if (reviewsEnabled === false) {
            throw new common_1.BadRequestException('Reviews are disabled for this product');
        }
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
        const normalizedSessionId = this.requireSessionId(sessionId);
        const cart = await this.prisma.cart.findFirst({
            where: { storeId: store.id, sessionId: normalizedSessionId, status: 'active' },
            include: { items: { include: { product: true, variant: true } } },
            orderBy: { createdAt: 'desc' },
        });
        if (!cart) {
            return {
                id: null,
                storeId: store.id,
                sessionId: normalizedSessionId,
                items: [],
                total: 0,
            };
        }
        const total = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.qty, 0);
        return { ...cart, total };
    }
    async addCartItem(slug, data) {
        const store = await this.getActiveStore(slug);
        const normalizedSessionId = this.requireSessionId(data.sessionId);
        const product = await this.prisma.product.findFirst({
            where: { id: data.productId, storeId: store.id, status: 'active' },
            include: { variants: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const variant = this.resolveVariantForCart(product.variants, data.variantId);
        const cart = (await this.prisma.cart.findFirst({
            where: {
                storeId: store.id,
                sessionId: normalizedSessionId,
                status: 'active',
            },
        })) ??
            (await this.prisma.cart.create({
                data: { storeId: store.id, sessionId: normalizedSessionId },
            }));
        const existing = await this.prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: data.productId,
                variantId: variant?.id ?? null,
            },
        });
        const nextQty = existing ? existing.qty + data.qty : data.qty;
        this.assertStockAvailability(product, variant, nextQty);
        const unitPrice = this.resolveEffectiveUnitPrice(product, variant);
        if (existing) {
            await this.prisma.cartItem.update({
                where: { id: existing.id },
                data: { qty: nextQty, unitPrice },
            });
        }
        else {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: data.productId,
                    variantId: variant?.id,
                    qty: data.qty,
                    unitPrice,
                },
            });
        }
        return this.getCart(slug, normalizedSessionId);
    }
    async updateCartItem(slug, sessionId, itemId, qty) {
        const store = await this.getActiveStore(slug);
        const normalizedSessionId = this.requireSessionId(sessionId);
        const cart = await this.prisma.cart.findFirst({
            where: { storeId: store.id, sessionId: normalizedSessionId, status: 'active' },
        });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const item = await this.prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
            include: { product: { include: { variants: true } }, variant: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Cart item not found');
        if (item.product.status !== 'active') {
            throw new common_1.BadRequestException('Product is not available');
        }
        const variant = this.resolveVariantForCart(item.product.variants, item.variantId ?? undefined);
        this.assertStockAvailability(item.product, variant, qty);
        const unitPrice = this.resolveEffectiveUnitPrice(item.product, variant);
        await this.prisma.cartItem.update({
            where: { id: item.id },
            data: { qty, unitPrice },
        });
        return this.getCart(slug, normalizedSessionId);
    }
    async deleteCartItem(slug, sessionId, itemId) {
        const store = await this.getActiveStore(slug);
        const normalizedSessionId = this.requireSessionId(sessionId);
        const cart = await this.prisma.cart.findFirst({
            where: { storeId: store.id, sessionId: normalizedSessionId, status: 'active' },
        });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const deleted = await this.prisma.cartItem.deleteMany({
            where: { id: itemId, cartId: cart.id },
        });
        if (!deleted.count)
            throw new common_1.NotFoundException('Cart item not found');
        return this.getCart(slug, normalizedSessionId);
    }
    async checkout(slug, data) {
        const store = await this.getActiveStore(slug);
        const normalizedSessionId = this.requireSessionId(data.sessionId);
        const cart = await this.prisma.cart.findFirst({
            where: {
                storeId: store.id,
                sessionId: normalizedSessionId,
                status: 'active',
            },
            include: {
                items: {
                    include: { product: { include: { variants: true } }, variant: true },
                },
            },
        });
        if (!cart || !cart.items.length)
            throw new common_1.NotFoundException('Cart is empty');
        const orderLines = cart.items.map((item) => {
            if (item.product.status !== 'active') {
                throw new common_1.BadRequestException(`Product "${item.product.title}" is not available`);
            }
            const variant = this.resolveVariantForCart(item.product.variants, item.variantId ?? undefined);
            this.assertStockAvailability(item.product, variant, item.qty);
            return {
                productId: item.productId,
                variantId: variant?.id ?? null,
                qty: item.qty,
                unitPrice: this.resolveEffectiveUnitPrice(item.product, variant),
                productTitle: item.product.title,
            };
        });
        const subtotal = orderLines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
        const discount = await this.computeCouponDiscount(store.id, subtotal, data.couponCode);
        const taxableBase = Math.max(0, subtotal - discount);
        const tax = await this.computeTax(store.id, taxableBase, data.shippingAddress);
        const shipping = 0;
        const total = Math.max(0, taxableBase + tax + shipping);
        const code = `ORD-${Date.now().toString(36).toUpperCase()}`;
        const paymentMethod = this.normalizePaymentMethod(data.paymentMethod);
        const checkoutResult = await this.prisma.$transaction(async (tx) => {
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
                        create: orderLines.map((line) => ({
                            productId: line.productId,
                            productNameSnapshot: line.productTitle,
                            qty: line.qty,
                            unitPrice: line.unitPrice,
                        })),
                    },
                },
                include: { items: true },
            });
            const paymentTx = await tx.paymentTransaction.create({
                data: {
                    storeId: store.id,
                    orderId: created.id,
                    provider: paymentMethod,
                    amount: total,
                    currency: 'USD',
                    status: paymentMethod === 'cod' ? 'pending' : 'requires_confirmation',
                    metadata: {
                        source: 'public_checkout',
                        paymentMethod,
                        paymentMeta: (data.paymentMeta ?? {}),
                    },
                },
            });
            for (const line of orderLines) {
                const product = await tx.product.findUnique({
                    where: { id: line.productId },
                    include: { variants: true },
                });
                if (!product) {
                    throw new common_1.BadRequestException(`Product not found for order line ${line.productId}`);
                }
                const variant = line.variantId
                    ? product.variants.find((item) => item.id === line.variantId) ?? null
                    : null;
                this.assertStockAvailability(product, variant, line.qty);
                const stockTrackingEnabled = product.stockTrackingEnabled;
                if (stockTrackingEnabled !== false) {
                    if (variant) {
                        const updatedVariant = await tx.productVariant.updateMany({
                            where: {
                                id: variant.id,
                                productId: product.id,
                                stock: { gte: line.qty },
                            },
                            data: { stock: { decrement: line.qty } },
                        });
                        if (!updatedVariant.count) {
                            throw new common_1.BadRequestException(`Insufficient stock for variant ${variant.optionValue}`);
                        }
                    }
                    else {
                        const updatedProduct = await tx.product.updateMany({
                            where: { id: product.id, stock: { gte: line.qty } },
                            data: { stock: { decrement: line.qty } },
                        });
                        if (!updatedProduct.count) {
                            throw new common_1.BadRequestException(`Insufficient stock for product "${product.title}"`);
                        }
                    }
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
            return { order: created, paymentTx };
        });
        return {
            ...checkoutResult.order,
            payment: this.buildCheckoutPaymentResult(paymentMethod, checkoutResult.paymentTx.id),
        };
    }
    async order(slug, orderCode, email) {
        const store = await this.getActiveStore(slug);
        const code = orderCode.trim();
        const order = await this.prisma.order.findFirst({
            where: {
                storeId: store.id,
                code,
                ...(email ? { customerEmail: email.trim().toLowerCase() } : {}),
            },
            include: {
                items: true,
                shipment: true,
                paymentTxns: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async policies(slug) {
        const store = await this.getActiveStore(slug);
        const [content, domain] = await Promise.all([
            this.prisma.platformSetting.findUnique({
                where: { key: `store_content:${store.id}` },
            }),
            this.prisma.platformSetting.findUnique({
                where: { key: `domain:${store.id}` },
            }),
        ]);
        const contentJson = this.asRecord(content?.valueJson);
        const domainJson = this.asRecord(domain?.valueJson);
        const domainName = this.asString(domainJson.domain, '') || `${store.slug}.1mis.io`;
        const storeName = store.name;
        const privacy = this.asString(contentJson.privacyPolicy, `This Privacy Policy describes how ${storeName} collects and uses customer data for orders, support, and fulfillment. For requests, contact support@${domainName}.`);
        const terms = this.asString(contentJson.termsAndConditions, `By placing an order with ${storeName}, you agree to product pricing, shipping timelines, and return conditions published on this storefront.`);
        return {
            storeId: store.id,
            storeName,
            privacyPolicy: privacy,
            termsAndConditions: terms,
            updatedAt: content?.updatedAt.toISOString() ??
                store.updatedAt.toISOString(),
        };
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
    requireSessionId(sessionId) {
        const normalized = sessionId?.trim();
        if (!normalized) {
            throw new common_1.BadRequestException('sessionId is required');
        }
        return normalized;
    }
    resolveVariantForCart(variants, variantId) {
        if (!variantId) {
            if (variants.length) {
                throw new common_1.BadRequestException('variantId is required for this product');
            }
            return null;
        }
        const variant = variants.find((item) => item.id === variantId);
        if (!variant) {
            throw new common_1.NotFoundException('Variant not found');
        }
        return variant;
    }
    assertStockAvailability(product, variant, qty) {
        if (qty < 1) {
            throw new common_1.BadRequestException('Quantity must be at least 1');
        }
        if (product.stockTrackingEnabled === false)
            return;
        const available = variant ? variant.stock : product.stock;
        if (qty > available) {
            if (variant) {
                throw new common_1.BadRequestException(`Only ${available} item(s) left for variant ${variant.optionValue}`);
            }
            throw new common_1.BadRequestException(`Only ${available} item(s) left for product "${product.title}"`);
        }
    }
    resolveEffectiveUnitPrice(product, variant) {
        if (variant?.price != null) {
            return Number(variant.price);
        }
        const hasActiveDiscount = product.discountedPrice != null &&
            (!product.discountEndsAt || product.discountEndsAt > new Date());
        if (hasActiveDiscount) {
            return Number(product.discountedPrice);
        }
        return Number(product.price);
    }
    normalizePaymentMethod(paymentMethod) {
        if (paymentMethod === 'stripe')
            return 'stripe';
        if (paymentMethod === 'sslcommerz')
            return 'sslcommerz';
        return 'cod';
    }
    buildCheckoutPaymentResult(paymentMethod, transactionId) {
        if (paymentMethod === 'stripe') {
            return {
                transactionId,
                provider: 'stripe',
                status: 'requires_confirmation',
                clientSecret: `pi_${transactionId}_secret_${Date.now().toString(36)}`,
            };
        }
        if (paymentMethod === 'sslcommerz') {
            return {
                transactionId,
                provider: 'sslcommerz',
                status: 'requires_confirmation',
                redirectUrl: `https://sandbox.sslcommerz.com/checkout/${transactionId}`,
            };
        }
        return {
            transactionId,
            provider: 'cod',
            status: 'pending',
            instructions: 'Collect cash on delivery',
        };
    }
    asRecord(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return {};
        }
        return value;
    }
    asString(value, fallback) {
        if (typeof value !== 'string')
            return fallback;
        const trimmed = value.trim();
        return trimmed || fallback;
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