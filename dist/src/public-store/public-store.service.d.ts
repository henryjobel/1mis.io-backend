import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class PublicStoreService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    meta(slug: string): Promise<{
        trackingConfig: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            pixelId: string | null;
            gtmId: string | null;
            capiToken: string | null;
            extraJson: Prisma.JsonValue | null;
        } | null;
        themeConfig: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            preset: string | null;
            customJson: Prisma.JsonValue | null;
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
    products(slug: string, options?: {
        category?: string;
        q?: string;
        sort?: string;
        page?: number;
        limit?: number;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<{
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
                price: Prisma.Decimal | null;
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
            price: Prisma.Decimal;
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
            price: Prisma.Decimal | null;
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
        price: Prisma.Decimal;
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
        price: Prisma.Decimal;
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
        price: Prisma.Decimal;
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
    createReview(slug: string, data: {
        productId: string;
        rating: number;
        customer?: string;
        title?: string;
        comment?: string;
    }): Promise<{
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
    getCart(slug: string, sessionId: string): Promise<{
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
                price: Prisma.Decimal;
                stock: number;
                categoryId: string | null;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string | null;
                price: Prisma.Decimal | null;
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
            unitPrice: Prisma.Decimal;
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
    addCartItem(slug: string, data: {
        sessionId: string;
        productId: string;
        variantId?: string;
        qty: number;
    }): Promise<{
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
                price: Prisma.Decimal;
                stock: number;
                categoryId: string | null;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string | null;
                price: Prisma.Decimal | null;
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
            unitPrice: Prisma.Decimal;
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
    updateCartItem(slug: string, sessionId: string, itemId: string, qty: number): Promise<{
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
                price: Prisma.Decimal;
                stock: number;
                categoryId: string | null;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string | null;
                price: Prisma.Decimal | null;
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
            unitPrice: Prisma.Decimal;
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
    deleteCartItem(slug: string, sessionId: string, itemId: string): Promise<{
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
                price: Prisma.Decimal;
                stock: number;
                categoryId: string | null;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string | null;
                price: Prisma.Decimal | null;
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
            unitPrice: Prisma.Decimal;
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
    checkout(slug: string, data: {
        sessionId: string;
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        couponCode?: string;
        shippingAddress?: Record<string, unknown>;
    }): Promise<{
        items: {
            id: string;
            createdAt: Date;
            productId: string | null;
            orderId: string;
            productNameSnapshot: string;
            qty: number;
            unitPrice: Prisma.Decimal;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        code: string;
        total: Prisma.Decimal;
        customerName: string;
        customerEmail: string;
        customerPhone: string | null;
        shippingAddress: Prisma.JsonValue | null;
        subtotal: Prisma.Decimal | null;
        discountTotal: Prisma.Decimal | null;
        taxTotal: Prisma.Decimal | null;
        shippingTotal: Prisma.Decimal | null;
        couponCode: string | null;
    }>;
    private computeCouponDiscount;
    private computeTax;
    private getActiveStore;
}
