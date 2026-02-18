import { RequestUser } from '../common/interfaces/request-user.interface';
import { AiGenerationService } from './ai-generation.service';
declare class GenerateAiDto {
    prompt: string;
    inputImages?: string[];
}
declare class ApplyAiJobDto {
    replaceProducts?: boolean;
}
export declare class AiGenerationController {
    private readonly aiGenerationService;
    constructor(aiGenerationService: AiGenerationService);
    generate(storeId: string, user: RequestUser, dto: GenerateAiDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.AiJobStatus;
        prompt: string;
        inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        resultJson: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessage: string | null;
        requestedBy: string;
    }>;
    getJob(storeId: string, jobId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.AiJobStatus;
        prompt: string;
        inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        resultJson: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessage: string | null;
        requestedBy: string;
    }>;
    getJobResult(storeId: string, jobId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AiJobStatus;
        result: import("@prisma/client/runtime/library").JsonValue;
        errorMessage: string | null;
    }>;
    applyJobResult(storeId: string, jobId: string, user: RequestUser, dto: ApplyAiJobDto): Promise<{
        themeConfig: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            preset: string | null;
            customJson: import("@prisma/client/runtime/library").JsonValue | null;
        };
        createdProductsCount: number;
        sections: string[];
        jobId: string;
        applied: boolean;
    }>;
}
export {};
