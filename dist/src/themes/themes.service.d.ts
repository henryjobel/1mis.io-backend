import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ThemesService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    presets(): {
        key: string;
        name: string;
        description: string;
    }[];
    storeTheme(storeId: string): Promise<{
        theme: {
            id: string;
            storeId: string;
            createdAt: Date;
            updatedAt: Date;
            preset: string | null;
            customJson: Prisma.JsonValue | null;
        } | null;
        presets: {
            key: string;
            name: string;
            description: string;
        }[];
    }>;
    apply(storeId: string, data: {
        preset: string;
        customJson?: Record<string, unknown>;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        preset: string | null;
        customJson: Prisma.JsonValue | null;
    }>;
}
