import { ConfigService } from '@nestjs/config';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { AiJobStatus } from '@prisma/client';
import { AiGenerationService } from './ai-generation.service';

describe('AiGenerationService', () => {
  let processor: ((jobId: string) => Promise<void>) | undefined;

  const prisma = {
    aiGenerationJob: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const queue = {
    registerAiProcessor: jest.fn((fn: (jobId: string) => Promise<void>) => {
      processor = fn;
    }),
    enqueueAiJob: jest.fn(),
  };

  const config = {
    get: jest.fn(() => ''),
  };

  const audit = {
    log: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    processor = undefined;
  });

  it('creates and enqueues job', async () => {
    prisma.aiGenerationJob.create.mockResolvedValue({ id: 'job1' });
    const service = new AiGenerationService(
      prisma as unknown as PrismaService,
      queue as unknown as QueueService,
      config as unknown as ConfigService,
      audit as unknown as AuditService,
    );

    const result = await service.createJob({
      storeId: 's1',
      requestedBy: 'u1',
      prompt: 'test',
    });
    expect(result.id).toBe('job1');
    expect(queue.enqueueAiJob).toHaveBeenCalledWith('job1');
  });

  it('processes job to completed with fallback', async () => {
    prisma.aiGenerationJob.findUnique.mockResolvedValue({
      id: 'job1',
      prompt: 'shoes',
      inputImagesJson: [],
    });
    const service = new AiGenerationService(
      prisma as unknown as PrismaService,
      queue as unknown as QueueService,
      config as unknown as ConfigService,
      audit as unknown as AuditService,
    );
    service.onModuleInit();

    expect(processor).toBeDefined();
    await processor?.('job1');

    const statuses = (prisma.aiGenerationJob.update.mock.calls as Array<[{
      data?: { status?: AiJobStatus };
    }]>)
      .map(([arg]) => arg.data?.status)
      .filter((status): status is AiJobStatus => Boolean(status));

    expect(statuses).toContain(AiJobStatus.running);
    expect(statuses).toContain(AiJobStatus.completed);
  });
});
