import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
}
