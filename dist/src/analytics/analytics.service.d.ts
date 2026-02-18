import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(storeId: string, from?: string, to?: string): Promise<{
        ordersCount: number;
        totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
        averageOrderValue: number | import("@prisma/client/runtime/library").Decimal;
        statusBreakdown: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
    }>;
    topProducts(storeId: string): Promise<{
        productId: string | null;
        productName: string;
        totalQty: number;
        revenueApprox: number | import("@prisma/client/runtime/library").Decimal;
    }[]>;
}
