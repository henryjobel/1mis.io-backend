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
        storeId: string;
        channel: string;
        recipient: string;
        templateKey: string | null;
        payload: Prisma.JsonValue | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    logs(storeId: string): Prisma.PrismaPromise<{
        id: string;
        storeId: string;
        channel: string;
        recipient: string;
        templateKey: string | null;
        payload: Prisma.JsonValue | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
