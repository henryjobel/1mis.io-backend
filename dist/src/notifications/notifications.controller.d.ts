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
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        channel: string;
        recipient: string;
        templateKey: string | null;
    }>;
    logs(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        channel: string;
        recipient: string;
        templateKey: string | null;
    }[]>;
}
export {};
