import { RequestUser } from '../common/interfaces/request-user.interface';
import { PromotionsService } from './promotions.service';
declare class CouponDto {
    code: string;
    type: 'flat' | 'percent';
    value: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    isActive?: boolean;
}
declare class TaxRuleDto {
    name: string;
    country?: string;
    region?: string;
    rate: number;
    isDefault?: boolean;
    isActive?: boolean;
}
export declare class PromotionsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    coupons(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        type: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startsAt: Date | null;
        endsAt: Date | null;
        isActive: boolean;
        usageLimit: number | null;
        usedCount: number;
    }[]>;
    createCoupon(storeId: string, dto: CouponDto, user: RequestUser): Promise<{
        type: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startsAt: Date | null;
        endsAt: Date | null;
        isActive: boolean;
        usageLimit: number | null;
        usedCount: number;
    }>;
    updateCoupon(storeId: string, couponId: string, dto: Partial<CouponDto>, user: RequestUser): Promise<{
        type: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startsAt: Date | null;
        endsAt: Date | null;
        isActive: boolean;
        usageLimit: number | null;
        usedCount: number;
    }>;
    deleteCoupon(storeId: string, couponId: string, user: RequestUser): Promise<{
        type: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        value: import("@prisma/client/runtime/library").Decimal;
        minOrderAmount: import("@prisma/client/runtime/library").Decimal | null;
        maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
        startsAt: Date | null;
        endsAt: Date | null;
        isActive: boolean;
        usageLimit: number | null;
        usedCount: number;
    }>;
    taxRules(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        country: string | null;
        region: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        isDefault: boolean;
    }[]>;
    createTaxRule(storeId: string, dto: TaxRuleDto, user: RequestUser): Promise<{
        name: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        country: string | null;
        region: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        isDefault: boolean;
    }>;
    updateTaxRule(storeId: string, taxRuleId: string, dto: Partial<TaxRuleDto>, user: RequestUser): Promise<{
        name: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        country: string | null;
        region: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        isDefault: boolean;
    }>;
    deleteTaxRule(storeId: string, taxRuleId: string, user: RequestUser): Promise<{
        name: string;
        id: string;
        storeId: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        country: string | null;
        region: string | null;
        rate: import("@prisma/client/runtime/library").Decimal;
        isDefault: boolean;
    }>;
}
export {};
