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
exports.ProductsService = exports.PRODUCT_AI_FIELDS = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const zod_1 = require("zod");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
exports.PRODUCT_AI_FIELDS = [
    'productName',
    'shortDescription',
    'longDescription',
    'seoTitle',
    'seoMetaDescription',
    'suggestedPrice',
    'discountedPrice',
    'variants',
    'sku',
    'actionItems',
];
const productAiVariantSchema = zod_1.z.object({
    optionName: zod_1.z.string().min(1),
    optionValue: zod_1.z.string().min(1),
    sku: zod_1.z.string().min(1).optional(),
    price: zod_1.z.coerce.number().nonnegative().optional(),
    stock: zod_1.z.coerce.number().int().nonnegative().optional(),
});
const productAiPayloadSchema = zod_1.z.object({
    productName: zod_1.z.string().min(2),
    shortDescription: zod_1.z.string().min(10),
    longDescription: zod_1.z.string().min(20),
    seoTitle: zod_1.z.string().min(2),
    seoMetaDescription: zod_1.z.string().min(10),
    suggestedPrice: zod_1.z.coerce.number().positive(),
    discountedPrice: zod_1.z.coerce.number().positive().optional().nullable(),
    variants: zod_1.z.array(productAiVariantSchema).min(1).max(20),
    sku: zod_1.z.string().min(3),
    actionItems: zod_1.z.array(zod_1.z.string().min(2)).min(1).max(10),
});
let ProductsService = class ProductsService {
    constructor(prisma, configService, auditService) {
        this.prisma = prisma;
        this.configService = configService;
        this.auditService = auditService;
    }
    async create(storeId, data, actor) {
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
    async list(storeId, options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
        const where = {
            storeId,
            ...(options?.q
                ? {
                    OR: [
                        { title: { contains: options.q, mode: 'insensitive' } },
                        { description: { contains: options.q, mode: 'insensitive' } },
                        { sku: { contains: options.q, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(options?.status ? { status: options.status } : {}),
            ...(options?.from || options?.to
                ? {
                    createdAt: {
                        ...(options?.from ? { gte: new Date(options.from) } : {}),
                        ...(options?.to ? { lte: new Date(options.to) } : {}),
                    },
                }
                : {}),
        };
        const orderBy = this.productSort(options?.sort);
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
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
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async findOne(storeId, productId) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, storeId },
            include: { variants: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async update(storeId, productId, data, actor) {
        const existing = await this.prisma.product.findFirst({
            where: { id: productId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Product not found');
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
    async delete(storeId, productId, actor) {
        const existing = await this.prisma.product.findFirst({
            where: { id: productId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Product not found');
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
    async duplicate(storeId, productId, data, actor) {
        const source = (await this.prisma.product.findFirst({
            where: { id: productId, storeId },
            include: { variants: true },
        }));
        if (!source)
            throw new common_1.NotFoundException('Product not found');
        const duplicated = await this.prisma.$transaction(async (tx) => {
            const cloned = await tx.product.create({
                data: {
                    storeId: source.storeId,
                    title: data.title?.trim() && data.title.trim().length
                        ? data.title.trim()
                        : `${source.title} Copy`,
                    description: source.description,
                    longDescription: source.longDescription,
                    seoTitle: source.seoTitle,
                    seoMetaDescription: source.seoMetaDescription,
                    sku: source.sku,
                    imageUrl: source.imageUrl,
                    imagesJson: source.imagesJson,
                    categoryId: source.categoryId,
                    price: source.price,
                    suggestedPrice: source.suggestedPrice,
                    discountedPrice: source.discountedPrice,
                    stock: source.stock,
                    status: data.status?.trim() || 'draft',
                    reviewsEnabled: source.reviewsEnabled,
                    stockTrackingEnabled: source.stockTrackingEnabled,
                    discountEndsAt: source.discountEndsAt,
                    tagsJson: source.tagsJson,
                    featuresJson: source.featuresJson,
                    actionItemsJson: source.actionItemsJson,
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
            throw new common_1.NotFoundException('Duplicated product not found');
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
    async updateDelivery(storeId, productId, enabled, actor) {
        await this.assertProductInStore(storeId, productId);
        const key = `product_delivery:${storeId}:${productId}`;
        const value = {
            productId,
            enabled,
            updatedAt: new Date().toISOString(),
            updatedBy: actor.id,
        };
        await this.prisma.platformSetting.upsert({
            where: { key },
            create: { key, valueJson: value },
            update: { valueJson: value },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'product.delivery.update',
            entityType: 'PlatformSetting',
            entityId: key,
            metaJson: { storeId, productId, enabled },
        });
        return value;
    }
    async generateAiFields(storeId, data, actor) {
        const imageUrls = this.normalizeImageUrls(data.imageUrls);
        if (!imageUrls.length && !data.prompt?.trim()) {
            throw new common_1.BadRequestException('prompt or imageUrls is required');
        }
        const generated = await this.generateProductIntelligence({
            prompt: data.prompt,
            imageUrls,
            region: data.region,
            currency: data.currency,
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'product.ai.generate',
            entityType: 'Store',
            entityId: storeId,
            metaJson: {
                imagesCount: imageUrls.length,
            },
        });
        return generated;
    }
    async regenerateAiField(storeId, productId, data, actor) {
        if (!exports.PRODUCT_AI_FIELDS.includes(data.field)) {
            throw new common_1.BadRequestException('Invalid field for regeneration');
        }
        const product = await this.prisma.product.findFirst({
            where: { id: productId, storeId },
            include: { variants: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const imageUrls = this.normalizeImageUrls(data.imageUrls);
        const generated = await this.generateProductIntelligence({
            prompt: data.prompt,
            imageUrls,
            region: data.region,
            currency: data.currency,
            existingProduct: product,
        });
        const field = data.field;
        const value = this.pickGeneratedField(generated, field);
        const apply = data.apply ?? false;
        let applied = false;
        let updatedProduct = null;
        let updatedVariants = null;
        if (apply) {
            if (field === 'variants') {
                const variants = value;
                const result = await this.prisma.$transaction(async (tx) => {
                    await tx.productVariant.deleteMany({ where: { productId } });
                    if (variants.length) {
                        await tx.productVariant.createMany({
                            data: variants.map((variant) => ({
                                productId,
                                optionName: variant.optionName,
                                optionValue: variant.optionValue,
                                sku: variant.sku,
                                price: variant.price,
                                stock: variant.stock,
                            })),
                        });
                    }
                    return tx.productVariant.findMany({
                        where: { productId },
                        orderBy: { createdAt: 'desc' },
                    });
                });
                applied = true;
                updatedVariants = result;
            }
            else {
                const updateData = this.toRegeneratedFieldUpdate(field, value);
                const updated = await this.prisma.product.update({
                    where: { id: productId },
                    data: updateData,
                });
                applied = true;
                updatedProduct = updated;
            }
        }
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'product.ai.regenerate_field',
            entityType: 'Product',
            entityId: productId,
            metaJson: {
                storeId,
                field,
                apply,
            },
        });
        return {
            productId,
            field,
            value,
            applied,
            updatedProduct,
            updatedVariants,
            generatedAt: new Date().toISOString(),
        };
    }
    async createVariant(storeId, productId, data, actor) {
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
    async listVariants(storeId, productId) {
        await this.assertProductInStore(storeId, productId);
        return this.prisma.productVariant.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateVariant(storeId, productId, variantId, data, actor) {
        await this.assertProductInStore(storeId, productId);
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant)
            throw new common_1.NotFoundException('Variant not found');
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
    async deleteVariant(storeId, productId, variantId, actor) {
        await this.assertProductInStore(storeId, productId);
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: variantId, productId },
        });
        if (!variant)
            throw new common_1.NotFoundException('Variant not found');
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
    async assertProductInStore(storeId, productId) {
        const existing = await this.prisma.product.findFirst({
            where: { id: productId, storeId },
            select: { id: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Product not found');
    }
    toCreateData(storeId, data) {
        const title = data.title?.trim() || data.productName?.trim();
        if (!title) {
            throw new common_1.BadRequestException('title or productName is required');
        }
        const priceCandidate = data.price ?? data.suggestedPrice;
        if (priceCandidate == null || Number.isNaN(priceCandidate)) {
            throw new common_1.BadRequestException('price or suggestedPrice is required');
        }
        return {
            storeId,
            title,
            description: data.description ?? data.shortDescription,
            longDescription: data.longDescription,
            seoTitle: data.seoTitle,
            seoMetaDescription: data.seoMetaDescription,
            sku: data.sku,
            imageUrl: data.imageUrl ?? (Array.isArray(data.images) ? data.images[0] : undefined),
            imagesJson: Array.isArray(data.images) && data.images.length
                ? data.images
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
            tagsJson: Array.isArray(data.tags) && data.tags.length
                ? data.tags
                : undefined,
            featuresJson: Array.isArray(data.features) && data.features.length
                ? data.features
                : undefined,
            actionItemsJson: Array.isArray(data.actionItems) && data.actionItems.length
                ? data.actionItems
                : undefined,
        };
    }
    toUpdateData(data) {
        const next = {};
        const title = data.title?.trim() || data.productName?.trim();
        if (title)
            next.title = title;
        if (data.description !== undefined || data.shortDescription !== undefined) {
            next.description = data.description ?? data.shortDescription;
        }
        if (data.longDescription !== undefined)
            next.longDescription = data.longDescription;
        if (data.seoTitle !== undefined)
            next.seoTitle = data.seoTitle;
        if (data.seoMetaDescription !== undefined) {
            next.seoMetaDescription = data.seoMetaDescription;
        }
        if (data.sku !== undefined)
            next.sku = data.sku;
        if (data.imageUrl !== undefined)
            next.imageUrl = data.imageUrl;
        if (Array.isArray(data.images)) {
            next.imagesJson = data.images;
            if (!data.imageUrl && data.images.length) {
                next.imageUrl = data.images[0];
            }
        }
        if (data.categoryId !== undefined)
            next.categoryId = data.categoryId;
        if (data.suggestedPrice !== undefined)
            next.suggestedPrice = data.suggestedPrice;
        if (data.discountedPrice !== undefined)
            next.discountedPrice = data.discountedPrice;
        if (data.price !== undefined)
            next.price = data.price;
        if (data.stock !== undefined)
            next.stock = data.stock;
        if (data.status !== undefined)
            next.status = data.status;
        if (data.reviewsEnabled !== undefined)
            next.reviewsEnabled = data.reviewsEnabled;
        if (data.stockTrackingEnabled !== undefined) {
            next.stockTrackingEnabled = data.stockTrackingEnabled;
        }
        if (data.discountEndsAt !== undefined) {
            next.discountEndsAt = data.discountEndsAt
                ? new Date(data.discountEndsAt)
                : null;
        }
        if (Array.isArray(data.tags)) {
            next.tagsJson = data.tags;
        }
        if (Array.isArray(data.features)) {
            next.featuresJson = data.features;
        }
        if (Array.isArray(data.actionItems)) {
            next.actionItemsJson = data.actionItems;
        }
        return next;
    }
    toRegeneratedFieldUpdate(field, value) {
        if (field === 'productName') {
            return { title: String(value ?? '').trim() };
        }
        if (field === 'shortDescription') {
            return { description: String(value ?? '').trim() };
        }
        if (field === 'longDescription') {
            return { longDescription: String(value ?? '').trim() };
        }
        if (field === 'seoTitle') {
            return { seoTitle: String(value ?? '').trim() };
        }
        if (field === 'seoMetaDescription') {
            return { seoMetaDescription: String(value ?? '').trim() };
        }
        if (field === 'suggestedPrice') {
            return { suggestedPrice: Number(value) };
        }
        if (field === 'discountedPrice') {
            const next = value == null ? null : Number(value);
            return {
                discountedPrice: next !== null && Number.isFinite(next) ? next : null,
            };
        }
        if (field === 'sku') {
            return { sku: String(value ?? '').trim() };
        }
        return { actionItemsJson: value };
    }
    pickGeneratedField(generated, field) {
        if (field === 'productName')
            return generated.productName;
        if (field === 'shortDescription')
            return generated.shortDescription;
        if (field === 'longDescription')
            return generated.longDescription;
        if (field === 'seoTitle')
            return generated.seoTitle;
        if (field === 'seoMetaDescription')
            return generated.seoMetaDescription;
        if (field === 'suggestedPrice')
            return generated.suggestedPrice;
        if (field === 'discountedPrice')
            return generated.discountedPrice ?? null;
        if (field === 'variants')
            return generated.variants;
        if (field === 'sku')
            return generated.sku;
        return generated.actionItems;
    }
    normalizeImageUrls(imageUrls) {
        if (!Array.isArray(imageUrls))
            return [];
        const unique = Array.from(new Set(imageUrls
            .map((item) => item?.trim())
            .filter((item) => Boolean(item))));
        if (unique.length > 5) {
            throw new common_1.BadRequestException('Maximum 5 images are allowed');
        }
        for (const url of unique) {
            try {
                const parsed = new URL(url);
                if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                    throw new common_1.BadRequestException('Only http/https image URLs are allowed');
                }
            }
            catch {
                throw new common_1.BadRequestException('Invalid image URL');
            }
        }
        return unique;
    }
    async generateProductIntelligence(input) {
        const fallback = this.fallbackProductIntelligence(input);
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey)
            return fallback;
        try {
            const model = this.configService.get('GEMINI_MODEL', 'gemini-1.5-flash');
            const instruction = this.buildAiInstruction(input);
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: instruction }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 1400,
                    },
                }),
            });
            if (!response.ok)
                return fallback;
            const raw = (await response.json());
            const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text)
                return fallback;
            const parsed = JSON.parse(this.stripCodeFence(text));
            const validated = productAiPayloadSchema.parse(parsed);
            return this.normalizeGeneratedPayload(validated, input);
        }
        catch {
            return fallback;
        }
    }
    buildAiInstruction(input) {
        const existingContext = input.existingProduct
            ? {
                title: input.existingProduct.title,
                description: input.existingProduct.description,
                longDescription: input.existingProduct.longDescription,
                seoTitle: input.existingProduct.seoTitle,
                seoMetaDescription: input.existingProduct.seoMetaDescription,
                price: Number(input.existingProduct.price),
                suggestedPrice: input.existingProduct.suggestedPrice != null
                    ? Number(input.existingProduct.suggestedPrice)
                    : null,
                discountedPrice: input.existingProduct.discountedPrice != null
                    ? Number(input.existingProduct.discountedPrice)
                    : null,
                sku: input.existingProduct.sku,
                variants: input.existingProduct.variants.map((item) => ({
                    optionName: item.optionName,
                    optionValue: item.optionValue,
                    sku: item.sku,
                    stock: item.stock,
                    price: item.price != null ? Number(item.price) : null,
                })),
            }
            : null;
        return `You are an ecommerce product intelligence generator.
Return ONLY valid JSON with this exact shape:
{
  "productName": string,
  "shortDescription": string,
  "longDescription": string,
  "seoTitle": string,
  "seoMetaDescription": string,
  "suggestedPrice": number,
  "discountedPrice": number | null,
  "variants": [{"optionName": string, "optionValue": string, "sku": string, "price": number, "stock": number}],
  "sku": string,
  "actionItems": string[]
}
Rules:
- 1 to 8 variants
- stock must be integer >= 0
- suggestedPrice must be > 0
- discountedPrice must be null or smaller than suggestedPrice
- actionItems should be practical and short
Region: ${input.region ?? 'global'}
Currency: ${(input.currency ?? 'USD').toUpperCase()}
Prompt: ${input.prompt ?? '(no prompt)'}
Image URLs:
${input.imageUrls.length ? input.imageUrls.join('\n') : '(none)'}
Existing product context:
${existingContext ? JSON.stringify(existingContext) : '(none)'}`;
    }
    fallbackProductIntelligence(input) {
        const baseName = this.inferBaseName(input.existingProduct?.title, input.prompt, input.imageUrls);
        const currency = (input.currency ?? 'USD').toUpperCase();
        const existingPrice = input.existingProduct?.suggestedPrice != null
            ? Number(input.existingProduct.suggestedPrice)
            : Number(input.existingProduct?.price ?? 0);
        const suggestedPrice = this.suggestPrice({
            name: baseName,
            region: input.region,
            currency,
            existingPrice: existingPrice > 0 ? existingPrice : undefined,
        });
        const discountedPrice = this.formatPrice(suggestedPrice * 0.9, currency);
        const skuBase = this.normalizeSku(input.existingProduct?.sku ?? baseName.slice(0, 20), baseName);
        const variants = input.existingProduct?.variants.length
            ? input.existingProduct.variants.slice(0, 8).map((variant, index) => ({
                optionName: variant.optionName || 'Style',
                optionValue: variant.optionValue || `Option ${index + 1}`,
                sku: this.normalizeSku(variant.sku ?? this.buildVariantSku(skuBase, variant.optionValue, index), `${skuBase}-${index + 1}`),
                price: variant.price != null ? Number(variant.price) : suggestedPrice,
                stock: variant.stock > 0 ? variant.stock : 20,
            }))
            : [
                {
                    optionName: 'Style',
                    optionValue: 'Standard',
                    sku: this.buildVariantSku(skuBase, 'standard', 0),
                    price: suggestedPrice,
                    stock: 20,
                },
            ];
        const shortDescription = input.existingProduct?.description?.trim() ||
            `A conversion-focused ${baseName.toLowerCase()} designed for everyday use and dependable quality.`;
        const longDescription = input.existingProduct?.longDescription?.trim() ||
            `${baseName} is crafted for buyers who value quality, comfort, and practical performance. It is optimized for ecommerce conversion with clear value messaging, trust-building copy, and strong product positioning.`;
        const seoTitle = input.existingProduct?.seoTitle?.trim() ||
            `${baseName} | Buy Online at Best Price`;
        const seoMetaDescription = input.existingProduct?.seoMetaDescription?.trim() ||
            `Shop ${baseName} with fast delivery, secure checkout, and competitive pricing.`;
        return this.normalizeGeneratedPayload({
            productName: baseName,
            shortDescription,
            longDescription,
            seoTitle,
            seoMetaDescription,
            suggestedPrice,
            discountedPrice,
            variants,
            sku: skuBase,
            actionItems: [
                'Add at least one lifestyle image',
                'Highlight key product benefit above the fold',
                'Add trust badge near Add to Cart button',
            ],
        }, input);
    }
    normalizeGeneratedPayload(payload, input) {
        const currency = (input.currency ?? 'USD').toUpperCase();
        const productName = payload.productName?.trim() ||
            this.inferBaseName(input.existingProduct?.title, input.prompt, input.imageUrls);
        const sku = this.normalizeSku(payload.sku, productName);
        const suggestedPrice = this.formatPrice(Number(payload.suggestedPrice), currency);
        const discountedCandidate = payload.discountedPrice == null ? null : Number(payload.discountedPrice);
        const discountedPrice = discountedCandidate != null &&
            Number.isFinite(discountedCandidate) &&
            discountedCandidate > 0 &&
            discountedCandidate < suggestedPrice
            ? this.formatPrice(discountedCandidate, currency)
            : undefined;
        const variants = payload.variants.slice(0, 8).map((variant, index) => ({
            optionName: variant.optionName.trim() || 'Style',
            optionValue: variant.optionValue.trim() || `Option ${index + 1}`,
            sku: this.normalizeSku(variant.sku ?? this.buildVariantSku(sku, variant.optionValue, index), `${sku}-${index + 1}`),
            price: variant.price != null
                ? this.formatPrice(Number(variant.price), currency)
                : suggestedPrice,
            stock: variant.stock != null && Number.isFinite(Number(variant.stock))
                ? Math.max(0, Math.round(Number(variant.stock)))
                : 20,
        }));
        const normalizedVariants = variants.length
            ? variants
            : [
                {
                    optionName: 'Style',
                    optionValue: 'Standard',
                    sku: this.buildVariantSku(sku, 'standard', 0),
                    price: suggestedPrice,
                    stock: 20,
                },
            ];
        const actionItems = Array.from(new Set(payload.actionItems
            .map((item) => item.trim())
            .filter((item) => item.length > 1))).slice(0, 8);
        return {
            productName,
            shortDescription: payload.shortDescription.trim(),
            longDescription: payload.longDescription.trim(),
            seoTitle: payload.seoTitle.trim(),
            seoMetaDescription: payload.seoMetaDescription.trim(),
            suggestedPrice,
            discountedPrice,
            variants: normalizedVariants,
            sku,
            actionItems: actionItems.length
                ? actionItems
                : ['Add one strong product benefit in first line of description'],
        };
    }
    inferBaseName(existingTitle, prompt, imageUrls) {
        const first = existingTitle?.trim() || prompt?.trim();
        if (first) {
            return first
                .replace(/\s+/g, ' ')
                .split(' ')
                .slice(0, 6)
                .join(' ')
                .replace(/\.$/, '');
        }
        if (imageUrls?.length) {
            try {
                const fileName = imageUrls[0].split('/').pop() ?? 'Product';
                return fileName
                    .replace(/\.[a-z0-9]+$/i, '')
                    .replace(/[-_]+/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 42);
            }
            catch {
                return 'Generated Product';
            }
        }
        return 'Generated Product';
    }
    suggestPrice(input) {
        const keyword = input.name.toLowerCase();
        let usdBase = input.existingPrice ?? 29.99;
        if (!input.existingPrice) {
            if (keyword.includes('premium') ||
                keyword.includes('leather') ||
                keyword.includes('luxury')) {
                usdBase = 59.99;
            }
            else if (keyword.includes('organic') || keyword.includes('natural')) {
                usdBase = 39.99;
            }
            else if (keyword.includes('mini') || keyword.includes('small')) {
                usdBase = 19.99;
            }
        }
        const region = String(input.region ?? '').toLowerCase();
        if (region.includes('bd') || region.includes('bangladesh'))
            usdBase *= 0.95;
        if (region.includes('in') || region.includes('india'))
            usdBase *= 0.9;
        if (region.includes('eu') || region.includes('europe'))
            usdBase *= 1.08;
        const fx = {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            INR: 83,
            BDT: 117,
        };
        const rate = fx[input.currency] ?? 1;
        return this.formatPrice(usdBase * rate, input.currency);
    }
    formatPrice(amount, currency) {
        if (!Number.isFinite(amount) || amount <= 0)
            return 1;
        const upper = currency.toUpperCase();
        if (upper === 'INR' || upper === 'BDT') {
            return Math.max(1, Math.round(amount));
        }
        return Number(amount.toFixed(2));
    }
    normalizeSku(candidate, fallbackSeed) {
        const base = (candidate || fallbackSeed)
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 28);
        if (base)
            return base;
        return `SKU-${Date.now().toString(36).toUpperCase()}`;
    }
    buildVariantSku(baseSku, optionValue, index) {
        const value = optionValue
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 10);
        return `${baseSku}-${value || `V${index + 1}`}`;
    }
    stripCodeFence(text) {
        return text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
    }
    productSort(sort) {
        const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
        if (key === 'createdat_asc')
            return { createdAt: 'asc' };
        if (key === 'price_desc')
            return { price: 'desc' };
        if (key === 'price_asc')
            return { price: 'asc' };
        if (key === 'stock_desc')
            return { stock: 'desc' };
        if (key === 'stock_asc')
            return { stock: 'asc' };
        if (key === 'title_asc')
            return { title: 'asc' };
        if (key === 'title_desc')
            return { title: 'desc' };
        return { createdAt: 'desc' };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        audit_service_1.AuditService])
], ProductsService);
//# sourceMappingURL=products.service.js.map