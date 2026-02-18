import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PromotionsService {
    private readonly prisma;
    private readonly auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    listCoupons(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        storeId: string;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startsAt: Date | null;
        endsAt: Date | null;
        usageLimit: number | null;
        usedCount: number;
    }[]>;
    createCoupon(storeId: string, data: {
        code: string;
        type: 'flat' | 'percent';
        value: number;
        minOrderAmount?: number;
        maxDiscount?: number;
        isActive?: boolean;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        storeId: string;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startsAt: Date | null;
        endsAt: Date | null;
        usageLimit: number | null;
        usedCount: number;
    }>;
    updateCoupon(storeId: string, couponId: string, data: Record<string, unknown>, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        storeId: string;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startsAt: Date | null;
        endsAt: Date | null;
        usageLimit: number | null;
        usedCount: number;
    }>;
    deleteCoupon(storeId: string, couponId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        storeId: string;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startsAt: Date | null;
        endsAt: Date | null;
        usageLimit: number | null;
        usedCount: number;
    }>;
    listTaxRules(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        country: string | null;
        region: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        isDefault: boolean;
    }[]>;
    createTaxRule(storeId: string, data: {
        name: string;
        country?: string;
        region?: string;
        rate: number;
        isDefault?: boolean;
        isActive?: boolean;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        country: string | null;
        region: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        isDefault: boolean;
    }>;
    updateTaxRule(storeId: string, taxRuleId: string, data: Record<string, unknown>, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        country: string | null;
        region: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        isDefault: boolean;
    }>;
    deleteTaxRule(storeId: string, taxRuleId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        country: string | null;
        region: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        isDefault: boolean;
    }>;
}
