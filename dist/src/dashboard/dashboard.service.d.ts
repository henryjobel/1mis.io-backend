import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(storeId: string): Promise<{
        stats: {
            totalRevenue: number;
            orders: number;
            customers: number;
            conversionRatePct: number;
            lowStockAlerts: number;
            productsSold: number;
        };
        recentOrders: {
            id: string;
            code: string;
            customerName: string;
            customerEmail: string;
            total: number;
            status: string;
            rawStatus: import(".prisma/client").$Enums.OrderStatus;
            createdAt: string;
        }[];
        website: {
            domain: string;
            domainStatus: string;
            sslStatus: string;
            publishedAt: string | null;
        };
        payments: {
            codEnabled: boolean;
            stripeEnabled: boolean;
            sslCommerzEnabled: boolean;
            mode: "test" | "live";
        };
    }>;
    private toUiStatus;
    private normalizeMode;
    private asRecord;
    private asString;
    private asBoolean;
}
