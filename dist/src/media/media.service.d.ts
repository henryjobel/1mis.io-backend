import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class MediaService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        type: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        altText: string | null;
    }[]>;
    upload(storeId: string, data: {
        type: string;
        url: string;
        altText?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        type: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        altText: string | null;
    }>;
    remove(storeId: string, assetId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        type: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        altText: string | null;
    }>;
}
