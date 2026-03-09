import { RequestUser } from '../common/interfaces/request-user.interface';
import { MediaService } from './media.service';
declare class CreateMediaDto {
    type: string;
    url: string;
    altText?: string;
}
declare class CreateMediaUploadSessionDto {
    type: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    altText?: string;
}
declare class CompleteMediaUploadDto {
    uploadId: string;
    url?: string;
    altText?: string;
}
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        storeId: string;
        altText: string | null;
    }[]>;
    upload(storeId: string, dto: CreateMediaDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        storeId: string;
        altText: string | null;
    }>;
    createUploadSession(storeId: string, dto: CreateMediaUploadSessionDto, user: RequestUser): Promise<{
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
    completeUpload(storeId: string, dto: CompleteMediaUploadDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        storeId: string;
        altText: string | null;
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
    remove(storeId: string, assetId: string, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        storeId: string;
        altText: string | null;
    }>;
}
export {};
