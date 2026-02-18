import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
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
