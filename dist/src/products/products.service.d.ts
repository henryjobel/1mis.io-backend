import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    create(storeId: string, data: {
        title: string;
        description?: string;
        sku?: string;
        imageUrl?: string;
        categoryId?: string;
        price: number;
        stock?: number;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    update(storeId: string, productId: string, data: {
        title?: string;
        description?: string;
        sku?: string;
        imageUrl?: string;
        categoryId?: string;
        price?: number;
        stock?: number;
        status?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    delete(storeId: string, productId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    createVariant(storeId: string, productId: string, data: {
        optionName: string;
        optionValue: string;
        sku?: string;
        price?: number;
        stock?: number;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    updateVariant(storeId: string, productId: string, variantId: string, data: {
        optionName?: string;
        optionValue?: string;
        sku?: string;
        price?: number;
        stock?: number;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    deleteVariant(storeId: string, productId: string, variantId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    private assertProductInStore;
}
