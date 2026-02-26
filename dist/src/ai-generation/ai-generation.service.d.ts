import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
export declare class AiGenerationService implements OnModuleInit {
    private readonly prisma;
    private readonly queueService;
    private readonly configService;
    private readonly auditService;
    private readonly logger;
    constructor(prisma: PrismaService, queueService: QueueService, configService: ConfigService, auditService: AuditService);
    onModuleInit(): void;
    createJob(params: {
        storeId: string;
        requestedBy: string;
        prompt: string;
        inputImagesJson?: unknown;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.AiJobStatus;
        requestedBy: string;
        prompt: string;
        inputImagesJson: Prisma.JsonValue | null;
        resultJson: Prisma.JsonValue | null;
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
        inputImagesJson: Prisma.JsonValue | null;
        resultJson: Prisma.JsonValue | null;
        errorMessage: string | null;
    }>;
    getJobResult(storeId: string, jobId: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AiJobStatus;
        result: Prisma.JsonValue;
        errorMessage: string | null;
    }>;
    applyJobResult(storeId: string, jobId: string, actor: {
        id: string;
        role: Role;
    }, options: {
        replaceProducts: boolean;
    }): Promise<{
        themeConfig: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            storeId: string;
            preset: string | null;
            customJson: Prisma.JsonValue | null;
        };
        createdProductsCount: number;
        sections: string[];
        historyId: `${string}-${string}-${string}-${string}-${string}`;
        jobId: string;
        applied: boolean;
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
    undoLatest(storeId: string, actor: {
        id: string;
        role: Role;
    }, reason?: string): Promise<{
        storeId: string;
        historyId: string;
        reverted: boolean;
        revertedAt: string;
    }>;
    revertHistory(storeId: string, historyId: string, actor: {
        id: string;
        role: Role;
    }, reason?: string): Promise<{
        storeId: string;
        historyId: string;
        reverted: boolean;
        revertedAt: string;
    }>;
    applySectionPrompt(storeId: string, data: {
        section: string;
        prompt: string;
        dryRun?: boolean;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        section: string;
        prompt: string;
        dryRun: boolean;
        persisted: boolean;
        historyId: null;
        patch: Record<string, unknown>;
        preview: Record<string, unknown>;
    } | {
        section: string;
        prompt: string;
        dryRun: boolean;
        persisted: boolean;
        historyId: `${string}-${string}-${string}-${string}-${string}`;
        patch: Record<string, unknown>;
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
    revertSectionHistory(storeId: string, historyId: string, actor: {
        id: string;
        role: Role;
    }, reason?: string): Promise<{
        storeId: string;
        historyId: string;
        reverted: boolean;
        revertedAt: string;
    }>;
    listPrompts(storeId: string): Promise<{
        id: string;
    }[]>;
    savePrompt(storeId: string, data: {
        prompt: string;
        title?: string;
    }, actor: {
        id: string;
        role: Role;
    }): Promise<{
        title: string;
        prompt: string;
        createdBy: string;
        createdAt: string;
        id: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    replayPrompt(storeId: string, promptId: string, actor: {
        id: string;
        role: Role;
    }): Promise<{
        jobId: string;
        promptId: string;
        title: string | null;
    }>;
    private processJob;
    private generateStorePlan;
    private fallbackResult;
    private stripCodeFence;
    private generateSectionPatch;
    private generateFullSitePatch;
    private generateFullSitePatchFromGemini;
    private generateFullSitePatchFallback;
    private resolveSectionRecord;
    private generateSectionPatchFromGemini;
    private sectionSchemaHint;
    private sanitizeSectionPatch;
    private generateSectionPatchFallback;
    private hasOwn;
    private asUnknownRecord;
    private normalizeColor;
    private extractEmail;
    private extractPhone;
    private extractDomain;
    private extractTailAfterKeyword;
    private applySectionPatch;
    private extractQuotedValue;
    private asRecord;
    private asString;
    private asBoolean;
    private nullableString;
    private nullableDate;
    private asJsonValue;
    private toStoreStatus;
}
