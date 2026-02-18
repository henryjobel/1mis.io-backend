import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    create(storeId: string, data: {
        name: string;
        slug: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        slug: string;
    }>;
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        slug: string;
    }[]>;
    update(storeId: string, categoryId: string, data: {
        name?: string;
        slug?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        slug: string;
    }>;
    remove(storeId: string, categoryId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        slug: string;
    }>;
}
