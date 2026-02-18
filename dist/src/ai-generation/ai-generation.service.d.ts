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
        prompt: string;
        inputImagesJson: Prisma.JsonValue | null;
        resultJson: Prisma.JsonValue | null;
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
        inputImagesJson: Prisma.JsonValue | null;
        resultJson: Prisma.JsonValue | null;
        errorMessage: string | null;
        requestedBy: string;
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
        jobId: string;
        applied: boolean;
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
}
