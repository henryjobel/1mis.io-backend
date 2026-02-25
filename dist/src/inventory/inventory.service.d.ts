import { PrismaService } from '../prisma/prisma.service';
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    summary(storeId: string, threshold?: number): Promise<{
        threshold: number;
        products: {
            total: number;
            active: number;
            lowStock: number;
            outOfStock: number;
        };
        variants: {
            total: number;
            lowStock: number;
            outOfStock: number;
        };
        inventoryValueUsd: number;
    }>;
    lowStock(storeId: string, options?: {
        threshold?: number;
        includeVariants?: boolean;
    }): Promise<{
        threshold: number;
        includeVariants: boolean;
        totalAlerts: number;
        products: {
            type: string;
            id: string;
            name: string;
            sku: string | null;
            stock: number;
            threshold: number;
            level: string;
            status: string;
            updatedAt: string;
        }[];
        variants: {
            type: string;
            id: string;
            productId: string;
            productName: string;
            name: string;
            sku: string | null;
            stock: number;
            threshold: number;
            level: string;
            status: string;
            updatedAt: string;
        }[];
    }>;
    private normalizeThreshold;
    private stockLevel;
}
