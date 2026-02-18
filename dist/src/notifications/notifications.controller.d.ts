import { RequestUser } from '../common/interfaces/request-user.interface';
import { NotificationsService } from './notifications.service';
declare class SendNotificationDto {
    channel: 'email' | 'sms' | 'whatsapp';
    recipient: string;
    templateKey?: string;
    payload?: Record<string, unknown>;
}
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    send(storeId: string, dto: SendNotificationDto, user: RequestUser): Promise<{
        id: string;
        storeId: string;
        channel: string;
        recipient: string;
        templateKey: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    logs(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        storeId: string;
        channel: string;
        recipient: string;
        templateKey: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
export {};
