import { RequestUser } from '../common/interfaces/request-user.interface';
import { ProductsService } from './products.service';
declare class CreateProductDto {
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
}
declare class UpdateProductDto {
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
}
declare class CreateVariantDto {
    optionName: string;
    optionValue: string;
    sku?: string;
    price?: number;
    stock?: number;
}
declare class UpdateVariantDto {
    optionName?: string;
    optionValue?: string;
    sku?: string;
    price?: number;
    stock?: number;
}
declare class DuplicateProductDto {
    title?: string;
    status?: string;
}
declare class GenerateProductAiDto {
    imageUrls?: string[];
    prompt?: string;
    region?: string;
    currency?: string;
}
declare class RegenerateProductAiFieldDto {
    field: string;
    imageUrls?: string[];
    prompt?: string;
    region?: string;
    currency?: string;
    apply?: boolean;
}
declare class ProductListQueryDto {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    sort?: string;
}
declare class UpdateProductDeliveryDto {
    enabled: boolean;
}
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(storeId: string, dto: CreateProductDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        title: string;
        longDescription: string | null;
        seoTitle: string | null;
        seoMetaDescription: string | null;
        suggestedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discountedPrice: import("@prisma/client/runtime/library").Decimal | null;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        description: string | null;
        imageUrl: string | null;
        imagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        reviewsEnabled: boolean;
        stockTrackingEnabled: boolean;
        discountEndsAt: Date | null;
        tagsJson: import("@prisma/client/runtime/library").JsonValue | null;
        featuresJson: import("@prisma/client/runtime/library").JsonValue | null;
        actionItemsJson: import("@prisma/client/runtime/library").JsonValue | null;
        categoryId: string | null;
    }>;
    generateFromAi(storeId: string, dto: GenerateProductAiDto, user: RequestUser): Promise<{
        productName: string;
        shortDescription: string;
        longDescription: string;
        seoTitle: string;
        seoMetaDescription: string;
        suggestedPrice: number;
        discountedPrice?: number;
        variants: {
            optionName: string;
            optionValue: string;
            sku?: string;
            price?: number;
            stock: number;
        }[];
        sku: string;
        actionItems: string[];
        tags: string[];
        features: string[];
    }>;
    list(storeId: string, query: ProductListQueryDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            title: string;
            longDescription: string | null;
            seoTitle: string | null;
            seoMetaDescription: string | null;
            suggestedPrice: import("@prisma/client/runtime/library").Decimal | null;
            discountedPrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
            description: string | null;
            imageUrl: string | null;
            imagesJson: import("@prisma/client/runtime/library").JsonValue | null;
            reviewsEnabled: boolean;
            stockTrackingEnabled: boolean;
            discountEndsAt: Date | null;
            tagsJson: import("@prisma/client/runtime/library").JsonValue | null;
            featuresJson: import("@prisma/client/runtime/library").JsonValue | null;
            actionItemsJson: import("@prisma/client/runtime/library").JsonValue | null;
            categoryId: string | null;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    findOne(storeId: string, productId: string): Promise<{
        variants: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            sku: string | null;
            optionName: string;
            optionValue: string;
            price: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        title: string;
        longDescription: string | null;
        seoTitle: string | null;
        seoMetaDescription: string | null;
        suggestedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discountedPrice: import("@prisma/client/runtime/library").Decimal | null;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        description: string | null;
        imageUrl: string | null;
        imagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        reviewsEnabled: boolean;
        stockTrackingEnabled: boolean;
        discountEndsAt: Date | null;
        tagsJson: import("@prisma/client/runtime/library").JsonValue | null;
        featuresJson: import("@prisma/client/runtime/library").JsonValue | null;
        actionItemsJson: import("@prisma/client/runtime/library").JsonValue | null;
        categoryId: string | null;
    }>;
    update(storeId: string, productId: string, dto: UpdateProductDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        title: string;
        longDescription: string | null;
        seoTitle: string | null;
        seoMetaDescription: string | null;
        suggestedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discountedPrice: import("@prisma/client/runtime/library").Decimal | null;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        description: string | null;
        imageUrl: string | null;
        imagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        reviewsEnabled: boolean;
        stockTrackingEnabled: boolean;
        discountEndsAt: Date | null;
        tagsJson: import("@prisma/client/runtime/library").JsonValue | null;
        featuresJson: import("@prisma/client/runtime/library").JsonValue | null;
        actionItemsJson: import("@prisma/client/runtime/library").JsonValue | null;
        categoryId: string | null;
    }>;
    remove(storeId: string, productId: string, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        title: string;
        longDescription: string | null;
        seoTitle: string | null;
        seoMetaDescription: string | null;
        suggestedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discountedPrice: import("@prisma/client/runtime/library").Decimal | null;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        description: string | null;
        imageUrl: string | null;
        imagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        reviewsEnabled: boolean;
        stockTrackingEnabled: boolean;
        discountEndsAt: Date | null;
        tagsJson: import("@prisma/client/runtime/library").JsonValue | null;
        featuresJson: import("@prisma/client/runtime/library").JsonValue | null;
        actionItemsJson: import("@prisma/client/runtime/library").JsonValue | null;
        categoryId: string | null;
    }>;
    duplicate(storeId: string, productId: string, dto: DuplicateProductDto, user: RequestUser): Promise<{
        variants: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            sku: string | null;
            optionName: string;
            optionValue: string;
            price: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        title: string;
        longDescription: string | null;
        seoTitle: string | null;
        seoMetaDescription: string | null;
        suggestedPrice: import("@prisma/client/runtime/library").Decimal | null;
        discountedPrice: import("@prisma/client/runtime/library").Decimal | null;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        description: string | null;
        imageUrl: string | null;
        imagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        reviewsEnabled: boolean;
        stockTrackingEnabled: boolean;
        discountEndsAt: Date | null;
        tagsJson: import("@prisma/client/runtime/library").JsonValue | null;
        featuresJson: import("@prisma/client/runtime/library").JsonValue | null;
        actionItemsJson: import("@prisma/client/runtime/library").JsonValue | null;
        categoryId: string | null;
    }>;
    updateProductDelivery(storeId: string, productId: string, dto: UpdateProductDeliveryDto, user: RequestUser): Promise<{
        productId: string;
        enabled: boolean;
        updatedAt: string;
        updatedBy: string;
    }>;
    regenerateAiField(storeId: string, productId: string, dto: RegenerateProductAiFieldDto, user: RequestUser): Promise<{
        productId: string;
        field: "productName" | "shortDescription" | "longDescription" | "seoTitle" | "seoMetaDescription" | "suggestedPrice" | "discountedPrice" | "variants" | "sku" | "actionItems";
        value: string | number | string[] | {
            optionName: string;
            optionValue: string;
            sku?: string;
            price?: number;
            stock: number;
        }[] | null;
        applied: boolean;
        updatedProduct: Record<string, unknown> | null;
        updatedVariants: Record<string, unknown>[] | null;
        generatedAt: string;
    }>;
    createVariant(storeId: string, productId: string, dto: CreateVariantDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        sku: string | null;
        optionName: string;
        optionValue: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
    }>;
    listVariants(storeId: string, productId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        sku: string | null;
        optionName: string;
        optionValue: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
    }[]>;
    updateVariant(storeId: string, productId: string, variantId: string, dto: UpdateVariantDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        sku: string | null;
        optionName: string;
        optionValue: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
    }>;
    deleteVariant(storeId: string, productId: string, variantId: string, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        sku: string | null;
        optionName: string;
        optionValue: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
    }>;
}
export {};
