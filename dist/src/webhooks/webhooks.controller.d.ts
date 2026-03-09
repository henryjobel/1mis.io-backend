import { WebhooksService } from './webhooks.service';
declare class WebhookPayloadDto {
    source: string;
    storeId?: string;
    payload: Record<string, unknown>;
}
declare class PaymentWebhookDto {
    eventType?: string;
    transactionId?: string;
    providerRef?: string;
    orderId?: string;
    status?: string;
    storeId?: string;
    payload?: Record<string, unknown>;
}
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    meta(dto: WebhookPayloadDto, secret?: string): Promise<{
        accepted: boolean;
    }>;
    gtm(dto: WebhookPayloadDto, secret?: string): Promise<{
        accepted: boolean;
    }>;
    stripe(dto: PaymentWebhookDto, secret?: string): Promise<{
        accepted: boolean;
        processed: boolean;
        provider: "sslcommerz" | "stripe";
        status: string;
        transactionId: string | null;
        orderId: string | null;
    }>;
    sslcommerz(dto: PaymentWebhookDto, secret?: string): Promise<{
        accepted: boolean;
        processed: boolean;
        provider: "sslcommerz" | "stripe";
        status: string;
        transactionId: string | null;
        orderId: string | null;
    }>;
}
export {};
