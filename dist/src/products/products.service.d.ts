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
    delete(storeId: string, productId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
        productId: string;
        sku: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        optionName: string;
        optionValue: string;
    }>;
    deleteVariant(storeId: string, productId: string, variantId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
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
    private assertProductInStore;
}
