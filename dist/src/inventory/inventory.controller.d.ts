import { InventoryService } from './inventory.service';
declare class InventoryQueryDto {
    threshold?: number;
    includeVariants?: string;
}
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    summary(storeId: string, query: InventoryQueryDto): Promise<{
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
    lowStock(storeId: string, query: InventoryQueryDto): Promise<{
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
}
export {};
