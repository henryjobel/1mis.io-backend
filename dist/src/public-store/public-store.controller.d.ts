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
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            pixelId: string | null;
            gtmId: string | null;
            capiToken: string | null;
            extraJson: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        themeConfig: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            preset: string | null;
            customJson: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: string;
        slug: string;
        status: import(".prisma/client").$Enums.StoreStatus;
        themePreset: string | null;
        publishedAt: Date | null;
    }>;
    products(slug: string, category?: string, q?: string, sort?: string, page?: string, limit?: string, minPrice?: string, maxPrice?: string): Promise<{
        items: ({
            category: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                slug: string;
            } | null;
            variants: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                stock: number;
                optionName: string;
                optionValue: string;
                productId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            title: string;
            description: string | null;
            sku: string | null;
            imageUrl: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
            categoryId: string | null;
        })[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    product(slug: string, productId: string): Promise<{
        category: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            slug: string;
        } | null;
        reviews: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            userId: string | null;
            title: string | null;
            productId: string;
            customer: string | null;
            rating: number;
            comment: string | null;
            isApproved: boolean;
        }[];
        variants: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            optionName: string;
            optionValue: string;
            productId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        title: string;
        description: string | null;
        sku: string | null;
        imageUrl: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        categoryId: string | null;
    }>;
    categories(slug: string): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        slug: string;
    })[]>;
    trending(slug: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        title: string;
        description: string | null;
        sku: string | null;
        imageUrl: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        categoryId: string | null;
    }[]>;
    bestSelling(slug: string): Promise<({
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        title: string;
        description: string | null;
        sku: string | null;
        imageUrl: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        categoryId: string | null;
    } | undefined)[]>;
    reviews(slug: string, productId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        userId: string | null;
        title: string | null;
        productId: string;
        customer: string | null;
        rating: number;
        comment: string | null;
        isApproved: boolean;
    }[]>;
    createReview(slug: string, dto: CreateReviewDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        userId: string | null;
        title: string | null;
        productId: string;
        customer: string | null;
        rating: number;
        comment: string | null;
        isApproved: boolean;
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
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                status: string;
                title: string;
                description: string | null;
                sku: string | null;
                imageUrl: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
                categoryId: string | null;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                stock: number;
                optionName: string;
                optionValue: string;
                productId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            variantId: string | null;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cartId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
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
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                status: string;
                title: string;
                description: string | null;
                sku: string | null;
                imageUrl: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
                categoryId: string | null;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                stock: number;
                optionName: string;
                optionValue: string;
                productId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            variantId: string | null;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cartId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
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
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                status: string;
                title: string;
                description: string | null;
                sku: string | null;
                imageUrl: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
                categoryId: string | null;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                stock: number;
                optionName: string;
                optionValue: string;
                productId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            variantId: string | null;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cartId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
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
                createdAt: Date;
                updatedAt: Date;
                storeId: string;
                status: string;
                title: string;
                description: string | null;
                sku: string | null;
                imageUrl: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
                categoryId: string | null;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string | null;
                price: import("@prisma/client/runtime/library").Decimal | null;
                stock: number;
                optionName: string;
                optionValue: string;
                productId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
            variantId: string | null;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            cartId: string;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        userId: string | null;
        sessionId: string | null;
    }>;
    checkout(slug: string, dto: CheckoutDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string | null;
            orderId: string;
            productNameSnapshot: string;
            qty: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        code: string;
        total: import("@prisma/client/runtime/library").Decimal;
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
