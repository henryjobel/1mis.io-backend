import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class MembersService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            name: string;
            id: string;
            email: string;
            isActive: boolean;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        storeId: string;
        createdAt: Date;
        userId: string;
        roleInStore: string;
    })[]>;
    invite(storeId: string, data: {
        name: string;
        email: string;
        roleInStore: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        storeId: string;
        createdAt: Date;
        userId: string;
        roleInStore: string;
    }>;
    updateRole(storeId: string, userId: string, data: {
        roleInStore?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        storeId: string;
        createdAt: Date;
        userId: string;
        roleInStore: string;
    }>;
    remove(storeId: string, userId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        storeId: string;
        createdAt: Date;
        userId: string;
        roleInStore: string;
    }>;
}
