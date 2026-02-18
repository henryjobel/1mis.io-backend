import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    send(storeId: string, data: {
        channel: 'email' | 'sms' | 'whatsapp';
        recipient: string;
        templateKey?: string;
        payload?: Record<string, unknown>;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        payload: Prisma.JsonValue | null;
        channel: string;
        recipient: string;
        templateKey: string | null;
    }>;
    logs(storeId: string): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        payload: Prisma.JsonValue | null;
        channel: string;
        recipient: string;
        templateKey: string | null;
    }[]>;
}
