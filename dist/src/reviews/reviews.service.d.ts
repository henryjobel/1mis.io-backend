import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    list(storeId: string, options?: {
        page?: number;
        limit?: number;
        q?: string;
        status?: string;
        from?: string;
        to?: string;
        sort?: string;
    }): Promise<{
        items: ({
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
            productId: string;
            customer: string | null;
            rating: number;
            title: string | null;
            comment: string | null;
            isApproved: boolean;
        })[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    approve(storeId: string, reviewId: string, isApproved: boolean, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        userId: string | null;
        productId: string;
        customer: string | null;
        rating: number;
        title: string | null;
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
        productId: string;
        customer: string | null;
        rating: number;
        title: string | null;
        comment: string | null;
        isApproved: boolean;
    }>;
    private toApprovalFilter;
    private reviewSort;
}
