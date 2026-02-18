import { ConfigService } from '@nestjs/config';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class WebhooksService {
    private readonly prisma;
    private readonly auditService;
    private readonly configService;
    constructor(prisma: PrismaService, auditService: AuditService, configService: ConfigService);
    receive(channel: 'meta' | 'gtm', data: {
        source: string;
        storeId?: string;
        payload: Record<string, unknown>;
    }, secret?: string): Promise<{
        accepted: boolean;
    }>;
}
