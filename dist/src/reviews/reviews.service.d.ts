import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<({
        product: {
            id: string;
            title: string;
        };
    } & {
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
    })[]>;
    approve(storeId: string, reviewId: string, isApproved: boolean, actor: {
        id: string;
        role: Role;
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
    remove(storeId: string, reviewId: string, actor: {
        id: string;
        role: Role;
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
}
