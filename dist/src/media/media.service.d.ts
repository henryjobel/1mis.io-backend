import { ConfigService } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import { BillingService } from '../billing/billing.service';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class MediaService {
    private readonly prisma;
    private readonly configService;
    private readonly auditService;
    private readonly billingService;
    constructor(prisma: PrismaService, configService: ConfigService, auditService: AuditService, billingService: BillingService);
    list(storeId: string): Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        storeId: string;
        altText: string | null;
    }[]>;
    createUploadSession(storeId: string, data: {
        type: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        altText?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        uploadId: `${string}-${string}-${string}-${string}-${string}`;
        key: string;
        method: string;
        uploadUrl: string;
        publicUrl: string;
        thumbnailUrl: string;
        expiresAt: string;
        signature: string;
        headers: {
            'content-type': string;
        };
        statusUrl: string;
        constraints: {
            maxSizeBytes: number;
            allowedMimeTypes: string[];
        };
    }>;
    uploadStatus(storeId: string, uploadId: string): Promise<{
        uploadId: string;
        status: string;
        key: string;
        mimeType: string | null;
        sizeBytes: number | undefined;
        url: string;
        thumbnailUrl: string | null;
        assetId: string | null;
        createdAt: string | null;
        completedAt: string | null;
        expiresAt: string | null;
    }>;
    upload(storeId: string, data: {
        type: string;
        url: string;
        altText?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        storeId: string;
        altText: string | null;
    }>;
    completeUpload(storeId: string, data: {
        uploadId: string;
        url?: string;
        altText?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        storeId: string;
        altText: string | null;
    }>;
    remove(storeId: string, assetId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        storeId: string;
        altText: string | null;
    }>;
    private buildAssetKey;
    private trimTrailingSlash;
    private buildThumbnailUrl;
    private buildUploadSignature;
    private readUploadSession;
    private mediaAssetMetaKey;
    private readStoredAssetSize;
    private bytesToMegabytes;
}
