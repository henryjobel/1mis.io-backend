import { WebhooksService } from './webhooks.service';
declare class WebhookPayloadDto {
    source: string;
    storeId?: string;
    payload: Record<string, unknown>;
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
}
export {};
