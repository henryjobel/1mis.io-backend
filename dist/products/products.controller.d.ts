import { ProductsService } from './products.service';
declare class CreateProductDto {
    title: string;
    description?: string;
    sku?: string;
    price: number;
    stock?: number;
}
declare class UpdateProductDto {
    title?: string;
    description?: string;
    sku?: string;
    price?: number;
    stock?: number;
    status?: string;
}
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(storeId: string, dto: CreateProductDto): import(".prisma/client").Prisma.Prisma__ProductClient<{
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        updatedAt: Date;
        title: string;
        description: string | null;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        updatedAt: Date;
        title: string;
        description: string | null;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
    }[]>;
    update(storeId: string, productId: string, dto: UpdateProductDto): Promise<{
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        updatedAt: Date;
        title: string;
        description: string | null;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
    }>;
    remove(storeId: string, productId: string): Promise<{
        id: string;
        createdAt: Date;
        storeId: string;
        status: string;
        updatedAt: Date;
        title: string;
        description: string | null;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        stock: number;
    }>;
}
export {};
