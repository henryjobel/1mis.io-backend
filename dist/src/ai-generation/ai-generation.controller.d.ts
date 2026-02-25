import { RequestUser } from '../common/interfaces/request-user.interface';
import { AiGenerationService } from './ai-generation.service';
declare class GenerateAiDto {
    prompt: string;
    inputImages?: string[];
}
declare class ApplyAiJobDto {
    replaceProducts?: boolean;
}
declare class SavePromptDto {
    prompt: string;
    title?: string;
}
declare class UndoAiChangeDto {
    reason?: string;
}
declare class RevertAiChangeDto {
    reason?: string;
}
declare class ApplySectionPromptDto {
    section: string;
    prompt: string;
    dryRun?: boolean;
}
declare class RevertSectionHistoryDto {
    reason?: string;
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
        requestedBy: string;
        prompt: string;
        inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        resultJson: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessage: string | null;
    }>;
    getJob(storeId: string, jobId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.AiJobStatus;
        requestedBy: string;
        prompt: string;
        inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        resultJson: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessage: string | null;
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
        historyId: `${string}-${string}-${string}-${string}-${string}`;
        jobId: string;
        applied: boolean;
    }>;
    prompts(storeId: string): Promise<{
        id: string;
    }[]>;
    savePrompt(storeId: string, dto: SavePromptDto, user: RequestUser): Promise<{
        title: string;
        prompt: string;
        createdBy: string;
        createdAt: string;
        id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    replayPrompt(storeId: string, promptId: string, user: RequestUser): Promise<{
        jobId: string;
        promptId: string;
        title: string | null;
    }>;
    history(storeId: string): Promise<{
        id: string;
        storeId: string;
        jobId: string;
        createdAt: string;
        appliedBy: string;
        replaceProducts: boolean;
        reverted: boolean;
        revertedAt: string;
        revertReason: string;
    }[]>;
    undoLatest(storeId: string, user: RequestUser, dto: UndoAiChangeDto): Promise<{
        storeId: string;
        historyId: string;
        reverted: boolean;
        revertedAt: string;
    }>;
    revertHistory(storeId: string, historyId: string, user: RequestUser, dto: RevertAiChangeDto): Promise<{
        storeId: string;
        historyId: string;
        reverted: boolean;
        revertedAt: string;
    }>;
    applySectionPrompt(storeId: string, dto: ApplySectionPromptDto, user: RequestUser): Promise<{
        section: string;
        prompt: string;
        dryRun: boolean;
        persisted: boolean;
        historyId: null;
        patch: {
            hero: {
                title: string;
                aiPrompt: string;
                updatedAt: string;
            };
        } | {
            [x: string]: {
                aiPrompt: string;
                aiSummary: string;
                updatedAt: string;
            };
            hero?: undefined;
        };
        preview: Record<string, unknown>;
    } | {
        section: string;
        prompt: string;
        dryRun: boolean;
        persisted: boolean;
        historyId: `${string}-${string}-${string}-${string}-${string}`;
        patch: {
            hero: {
                title: string;
                aiPrompt: string;
                updatedAt: string;
            };
        } | {
            [x: string]: {
                aiPrompt: string;
                aiSummary: string;
                updatedAt: string;
            };
            hero?: undefined;
        };
        preview: Record<string, unknown>;
    }>;
    sectionHistory(storeId: string): Promise<{
        id: string;
        storeId: string;
        section: string;
        prompt: string;
        createdAt: string;
        appliedBy: string;
        reverted: boolean;
        revertedAt: string;
        revertReason: string;
        patch: Record<string, unknown>;
        preview: Record<string, unknown>;
    }[]>;
    revertSectionHistory(storeId: string, historyId: string, user: RequestUser, dto: RevertSectionHistoryDto): Promise<{
        storeId: string;
        historyId: string;
        reverted: boolean;
        revertedAt: string;
    }>;
}
export {};
