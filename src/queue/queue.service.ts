import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsOptions, Queue, Worker } from 'bullmq';

type AiProcessor = (jobId: string) => Promise<void>;

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private queue?: Queue;
  private worker?: Worker;
  private aiProcessor?: AiProcessor;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');

    if (!host || !port) {
      this.logger.warn('Redis config missing. Queue runs in fallback mode.');
      return;
    }

    try {
      const connection = { host, port };
      this.queue = new Queue('ai-generation', { connection });
      this.worker = new Worker(
        'ai-generation',
        async (job) => {
          if (!this.aiProcessor) return;
          await this.aiProcessor(job.data.jobId as string);
        },
        { connection },
      );
      this.logger.log('BullMQ queue initialized');
    } catch (error) {
      this.logger.warn(`Queue init failed, fallback mode enabled: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
  }

  registerAiProcessor(processor: AiProcessor) {
    this.aiProcessor = processor;
  }

  async enqueueAiJob(jobId: string, opts?: JobsOptions) {
    if (this.queue) {
      await this.queue.add('generate-store-assets', { jobId }, opts);
      return;
    }

    if (this.aiProcessor) {
      setTimeout(() => {
        void this.aiProcessor?.(jobId);
      }, 0);
    }
  }
}
