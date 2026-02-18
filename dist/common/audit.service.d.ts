import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(params: {
        actorUserId?: string;
        role?: Role;
        action: string;
        entityType: string;
        entityId: string;
        metaJson?: Record<string, unknown>;
    }): Promise<void>;
}
