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
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    findOne(storeId: string, productId: string): Promise<{
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
    update(storeId: string, productId: string, dto: UpdateProductDto, user: RequestUser): Promise<{
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
    remove(storeId: string, productId: string, user: RequestUser): Promise<{
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
    createVariant(storeId: string, productId: string, dto: CreateVariantDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        optionName: string;
        optionValue: string;
        productId: string;
    }>;
    listVariants(storeId: string, productId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        optionName: string;
        optionValue: string;
        productId: string;
    }[]>;
    updateVariant(storeId: string, productId: string, variantId: string, dto: UpdateVariantDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        optionName: string;
        optionValue: string;
        productId: string;
    }>;
    deleteVariant(storeId: string, productId: string, variantId: string, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        optionName: string;
        optionValue: string;
        productId: string;
    }>;
}
export {};
