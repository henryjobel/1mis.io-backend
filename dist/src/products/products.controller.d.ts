import { RequestUser } from '../common/interfaces/request-user.interface';
import { ProductsService } from './products.service';
declare class CreateProductDto {
    title: string;
    description?: string;
    sku?: string;
    imageUrl?: string;
    categoryId?: string;
    price: number;
    stock?: number;
}
declare class UpdateProductDto {
    title?: string;
    description?: string;
    sku?: string;
    imageUrl?: string;
    categoryId?: string;
    price?: number;
    stock?: number;
    status?: string;
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
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(storeId: string, dto: CreateProductDto, user: RequestUser): Promise<{
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
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    findOne(storeId: string, productId: string): Promise<{
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
    update(storeId: string, productId: string, dto: UpdateProductDto, user: RequestUser): Promise<{
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
    remove(storeId: string, productId: string, user: RequestUser): Promise<{
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
    createVariant(storeId: string, productId: string, dto: CreateVariantDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        optionName: string;
        optionValue: string;
    }>;
    listVariants(storeId: string, productId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        optionName: string;
        optionValue: string;
    }[]>;
    updateVariant(storeId: string, productId: string, variantId: string, dto: UpdateVariantDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        optionName: string;
        optionValue: string;
    }>;
    deleteVariant(storeId: string, productId: string, variantId: string, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        optionName: string;
        optionValue: string;
    }>;
}
export {};
