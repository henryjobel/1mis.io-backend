import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsOptions } from 'bullmq';
type AiProcessor = (jobId: string) => Promise<void>;
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private queue?;
    private worker?;
    private aiProcessor?;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    registerAiProcessor(processor: AiProcessor): void;
    enqueueAiJob(jobId: string, opts?: JobsOptions): Promise<void>;
}
export {};
