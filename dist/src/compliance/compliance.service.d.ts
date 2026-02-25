import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ComplianceService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    requestExport(storeId: string, note: string | undefined, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        type: string;
        status: string;
        storeId: string;
        note: string | null;
        requestedBy: string;
        requestedAt: string;
        result: {
            downloadUrl: string;
        };
    }>;
    requestDelete(storeId: string, note: string | undefined, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        type: string;
        status: string;
        storeId: string;
        note: string | null;
        requestedBy: string;
        requestedAt: string;
    }>;
    requests(storeId: string, page?: number, limit?: number): Promise<{
        items: {
            id: string;
            type: string;
            status: string;
            note: string;
            requestedBy: string;
            requestedAt: string;
            result: Record<string, unknown>;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
    private asRecord;
    private asString;
}
