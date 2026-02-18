import { PublicStoreService } from './public-store.service';
declare class AddCartItemDto {
    sessionId: string;
    productId: string;
    variantId?: string;
    qty: number;
}
declare class UpdateCartItemDto {
    qty: number;
}
declare class CheckoutDto {
    sessionId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    couponCode?: string;
    shippingAddress?: Record<string, unknown>;
}
declare class CreateReviewDto {
    productId: string;
    rating: number;
    customer?: string;
    title?: string;
    comment?: string;
}
export declare class PublicStoreController {
    private readonly publicStoreService;
    constructor(publicStoreService: PublicStoreService);
    meta(slug: string): Promise<{
        trackingConfig: {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            pixelId: string | null;
            gtmId: string | null;
            capiToken: string | null;
            extraJson: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        themeConfig: {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            preset: string | null;
            customJson: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
    } & {
        name: string;
        id: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        slug: string;
        themePreset: string | null;
        publishedAt: Date | null;
    }>;
    products(slug: string, category?: string, q?: string, sort?: string, page?: string, limit?: string, minPrice?: string, maxPrice?: string): Promise<{
        items: ({
            category: {
                name: string;
                id: string;
                storeId: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
            } | null;
            variants: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                stock: number;
                optionName: string;
                optionValue: string;
            }[];
        } & {
            id: string;
            storeId: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            title: string;
            sku: string | null;
            imageUrl: string | null;
            categoryId: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
        })[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    product(slug: string, productId: string): Promise<{
        reviews: {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            title: string | null;
            isApproved: boolean;
            userId: string | null;
            customer: string | null;
            rating: number;
            comment: string | null;
        }[];
        category: {
            name: string;
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
        } | null;
        variants: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            sku: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            optionName: string;
            optionValue: string;
        }[];
    } & {
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        sku: string | null;
        imageUrl: string | null;
        categoryId: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
    }>;
    categories(slug: string): Promise<({
        _count: {
            products: number;
        };
    } & {
        name: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
    })[]>;
    trending(slug: string): Promise<{
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        sku: string | null;
        imageUrl: string | null;
        categoryId: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
    }[]>;
    bestSelling(slug: string): Promise<({
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        sku: string | null;
        imageUrl: string | null;
        categoryId: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
    } | undefined)[]>;
    reviews(slug: string, productId?: string): Promise<{
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        title: string | null;
        isApproved: boolean;
        userId: string | null;
        customer: string | null;
        rating: number;
        comment: string | null;
    }[]>;
    createReview(slug: string, dto: CreateReviewDto): Promise<{
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        title: string | null;
        isApproved: boolean;
        userId: string | null;
        customer: string | null;
        rating: number;
        comment: string | null;
    }>;
    cart(slug: string, sessionId: string): Promise<{
        id: null;
        storeId: string;
        sessionId: string;
        items: never[];
        total: number;
    } | {
        total: number;
        items: ({
            product: {
                id: string;
                storeId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                sku: string | null;
                imageUrl: string | null;
                categoryId: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                stock: number;
                optionName: string;
                optionValue: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cartId: string;
            variantId: string | null;
        })[];
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        sessionId: string | null;
    }>;
    addCartItem(slug: string, dto: AddCartItemDto): Promise<{
        id: null;
        storeId: string;
        sessionId: string;
        items: never[];
        total: number;
    } | {
        total: number;
        items: ({
            product: {
                id: string;
                storeId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                sku: string | null;
                imageUrl: string | null;
                categoryId: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                stock: number;
                optionName: string;
                optionValue: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cartId: string;
            variantId: string | null;
        })[];
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        sessionId: string | null;
    }>;
    updateCartItem(slug: string, itemId: string, dto: UpdateCartItemDto, sessionId: string): Promise<{
        id: null;
        storeId: string;
        sessionId: string;
        items: never[];
        total: number;
    } | {
        total: number;
        items: ({
            product: {
                id: string;
                storeId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                sku: string | null;
                imageUrl: string | null;
                categoryId: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                stock: number;
                optionName: string;
                optionValue: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cartId: string;
            variantId: string | null;
        })[];
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        sessionId: string | null;
    }>;
    deleteCartItem(slug: string, itemId: string, sessionId: string): Promise<{
        id: null;
        storeId: string;
        sessionId: string;
        items: never[];
        total: number;
    } | {
        total: number;
        items: ({
            product: {
                id: string;
                storeId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                sku: string | null;
                imageUrl: string | null;
                categoryId: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                stock: number;
                optionName: string;
                optionValue: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cartId: string;
            variantId: string | null;
        })[];
        id: string;
        storeId: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        sessionId: string | null;
    }>;
    checkout(slug: string, dto: CheckoutDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            orderId: string;
            productId: string | null;
            productNameSnapshot: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        storeId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        code: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string | null;
        shippingAddress: import("@prisma/client/runtime/library").JsonValue | null;
        subtotal: import("@prisma/client/runtime/library").Decimal | null;
        discountTotal: import("@prisma/client/runtime/library").Decimal | null;
        taxTotal: import("@prisma/client/runtime/library").Decimal | null;
        shippingTotal: import("@prisma/client/runtime/library").Decimal | null;
        couponCode: string | null;
    }>;
}
export {};
