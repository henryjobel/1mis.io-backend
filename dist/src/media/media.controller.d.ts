import { RequestUser } from '../common/interfaces/request-user.interface';
import { MediaService } from './media.service';
declare class CreateMediaDto {
    type: string;
    url: string;
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
        storeId: string;
        url: string;
        altText: string | null;
    }[]>;
    upload(storeId: string, dto: CreateMediaDto, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        storeId: string;
        url: string;
        altText: string | null;
    }>;
    remove(storeId: string, assetId: string, user: RequestUser): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        storeId: string;
        url: string;
        altText: string | null;
    }>;
}
export {};
