import { RequestUser } from '../common/interfaces/request-user.interface';
import { NotificationsService } from './notifications.service';
declare class SendNotificationDto {
    channel: 'email' | 'sms' | 'whatsapp';
    recipient: string;
    templateKey?: string;
    payload?: Record<string, unknown>;
}
declare class NotificationLogsQueryDto {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    sort?: string;
}
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    send(storeId: string, dto: SendNotificationDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        channel: string;
        recipient: string;
        templateKey: string | null;
    }>;
    logs(storeId: string, query: NotificationLogsQueryDto): Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            status: string;
            payload: import("@prisma/client/runtime/library").JsonValue | null;
            channel: string;
            recipient: string;
            templateKey: string | null;
        }[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }>;
}
export {};
