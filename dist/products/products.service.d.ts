import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(storeId: string, data: {
        title: string;
        description?: string;
        sku?: string;
        price: number;
        stock?: number;
    }): import(".prisma/client").Prisma.Prisma__ProductClient<{
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
    update(storeId: string, productId: string, data: {
        title?: string;
        description?: string;
        sku?: string;
        price?: number;
        stock?: number;
        status?: string;
    }): Promise<{
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
    delete(storeId: string, productId: string): Promise<{
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
