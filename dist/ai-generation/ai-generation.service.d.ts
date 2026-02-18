import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
export declare class AiGenerationService implements OnModuleInit {
    private readonly prisma;
    private readonly queueService;
    private readonly logger;
    constructor(prisma: PrismaService, queueService: QueueService);
    onModuleInit(): void;
    createJob(params: {
        storeId: string;
        requestedBy: string;
        prompt: string;
        inputImagesJson?: unknown;
    }): Promise<{
        id: string;
        createdAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.AiJobStatus;
        updatedAt: Date;
        prompt: string;
        inputImagesJson: import("@prisma/client/runtime/library").JsonValue | null;
        resultJson: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessage: string | null;
        requestedBy: string;
    }>;
    getJob(storeId: string, jobId: string): Promise<{
        id: string;
        createdAt: Date;
        storeId: string;
        status: import(".prisma/client").$Enums.AiJobStatus;
        updatedAt: Date;
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
    private processJob;
}
