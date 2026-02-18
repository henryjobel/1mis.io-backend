import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    getConfig(storeId: string): Promise<string | number | boolean | Prisma.JsonObject | Prisma.JsonArray>;
    upsertConfig(storeId: string, data: Record<string, unknown>, actor: {
        id: string;
        role: Role;
    }): Promise<{
        updatedAt: Date;
        key: string;
        valueJson: Prisma.JsonValue;
    }>;
    createIntent(storeId: string, data: {
        amount: number;
        orderId?: string;
        provider?: string;
        currency?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        orderId: string | null;
        provider: string;
        providerRef: string | null;
        amount: Prisma.Decimal;
        currency: string;
        metadata: Prisma.JsonValue | null;
    }>;
    confirm(storeId: string, data: {
        transactionId: string;
        providerRef: string;
        status?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        orderId: string | null;
        provider: string;
        providerRef: string | null;
        amount: Prisma.Decimal;
        currency: string;
        metadata: Prisma.JsonValue | null;
    }>;
    refund(storeId: string, data: {
        transactionId: string;
        amount?: number;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        orderId: string | null;
        provider: string;
        providerRef: string | null;
        amount: Prisma.Decimal;
        currency: string;
        metadata: Prisma.JsonValue | null;
    }>;
    transactions(storeId: string): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        orderId: string | null;
        provider: string;
        providerRef: string | null;
        amount: Prisma.Decimal;
        currency: string;
        metadata: Prisma.JsonValue | null;
    }[]>;
}
