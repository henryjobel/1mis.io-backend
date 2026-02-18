import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class PublicStoreService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    meta(slug: string): Promise<{
        trackingConfig: {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            pixelId: string | null;
            gtmId: string | null;
            capiToken: string | null;
            extraJson: Prisma.JsonValue | null;
        } | null;
        themeConfig: {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            preset: string | null;
            customJson: Prisma.JsonValue | null;
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
                price: Prisma.Decimal | null;
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
            price: Prisma.Decimal;
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
            price: Prisma.Decimal | null;
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
        price: Prisma.Decimal;
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
        price: Prisma.Decimal;
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
        price: Prisma.Decimal;
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
    createReview(slug: string, data: {
        productId: string;
        rating: number;
        customer?: string;
        title?: string;
        comment?: string;
    }): Promise<{
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
                storeId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                sku: string | null;
                imageUrl: string | null;
                categoryId: string | null;
                price: Prisma.Decimal;
                stock: number;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sku: string | null;
                price: Prisma.Decimal | null;
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
            unitPrice: Prisma.Decimal;
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
                storeId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                sku: string | null;
                imageUrl: string | null;
                categoryId: string | null;
                price: Prisma.Decimal;
                stock: number;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sku: string | null;
                price: Prisma.Decimal | null;
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
            unitPrice: Prisma.Decimal;
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
                storeId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                sku: string | null;
                imageUrl: string | null;
                categoryId: string | null;
                price: Prisma.Decimal;
                stock: number;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sku: string | null;
                price: Prisma.Decimal | null;
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
            unitPrice: Prisma.Decimal;
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
                storeId: string;
                status: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                sku: string | null;
                imageUrl: string | null;
                categoryId: string | null;
                price: Prisma.Decimal;
                stock: number;
            };
            variant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                productId: string;
                sku: string | null;
                price: Prisma.Decimal | null;
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
            unitPrice: Prisma.Decimal;
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
            orderId: string;
            productId: string | null;
            productNameSnapshot: string;
            qty: number;
            unitPrice: Prisma.Decimal;
        }[];
    } & {
        id: string;
        storeId: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        total: Prisma.Decimal;
        code: string;
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
