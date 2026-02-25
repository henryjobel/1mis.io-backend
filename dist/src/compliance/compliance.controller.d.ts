import { RequestUser } from '../common/interfaces/request-user.interface';
import { ComplianceService } from './compliance.service';
declare class GdprRequestDto {
    note?: string;
}
declare class ListGdprRequestsQueryDto {
    page?: number;
    limit?: number;
}
export declare class ComplianceController {
    private readonly complianceService;
    constructor(complianceService: ComplianceService);
    requestExport(storeId: string, dto: GdprRequestDto, user: RequestUser): Promise<{
        id: string;
        type: string;
        status: string;
        storeId: string;
        note: string | null;
        requestedBy: string;
        requestedAt: string;
        result: {
            downloadUrl: string;
        };
    }>;
    requestDelete(storeId: string, dto: GdprRequestDto, user: RequestUser): Promise<{
        id: string;
        type: string;
        status: string;
        storeId: string;
        note: string | null;
        requestedBy: string;
        requestedAt: string;
    }>;
    requests(storeId: string, query: ListGdprRequestsQueryDto): Promise<{
        items: {
            id: string;
            type: string;
            status: string;
            note: string;
            requestedBy: string;
            requestedAt: string;
            result: Record<string, unknown>;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
}
export {};
