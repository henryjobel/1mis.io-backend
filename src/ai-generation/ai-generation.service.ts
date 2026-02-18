import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiJobStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

const aiResultSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
  }),
  products: z
    .array(
      z.object({
        title: z.string(),
        price: z.number(),
        stock: z.number().int().nonnegative(),
      }),
    )
    .min(1),
  sections: z.array(z.string()).min(1),
});

@Injectable()
export class AiGenerationService implements OnModuleInit {
  private readonly logger = new Logger(AiGenerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.queueService.registerAiProcessor(async (jobId: string) => {
      await this.processJob(jobId);
    });
  }

  async createJob(params: {
    storeId: string;
    requestedBy: string;
    prompt: string;
    inputImagesJson?: unknown;
  }) {
    const job = await this.prisma.aiGenerationJob.create({
      data: {
        storeId: params.storeId,
        requestedBy: params.requestedBy,
        prompt: params.prompt,
        inputImagesJson: params.inputImagesJson as Prisma.InputJsonValue | undefined,
        status: AiJobStatus.queued,
      },
    });

    await this.queueService.enqueueAiJob(job.id);

    return job;
  }

  async getJob(storeId: string, jobId: string) {
    const job = await this.prisma.aiGenerationJob.findFirst({ where: { id: jobId, storeId } });
    if (!job) throw new NotFoundException('AI job not found');
    return job;
  }

  async getJobResult(storeId: string, jobId: string) {
    const job = await this.getJob(storeId, jobId);
    return {
      id: job.id,
      status: job.status,
      result: job.resultJson,
      errorMessage: job.errorMessage,
    };
  }

  private async processJob(jobId: string) {
    await this.prisma.aiGenerationJob.update({
      where: { id: jobId },
      data: { status: AiJobStatus.running },
    });

    try {
      const job = await this.prisma.aiGenerationJob.findUnique({ where: { id: jobId } });
      if (!job) throw new Error('Job not found');

      const result = await this.generateStorePlan({
        prompt: job.prompt,
        inputImages: Array.isArray(job.inputImagesJson) ? job.inputImagesJson : [],
      });

      await this.prisma.aiGenerationJob.update({
        where: { id: jobId },
        data: {
          status: AiJobStatus.completed,
          resultJson: result as Prisma.InputJsonValue,
          errorMessage: null,
        },
      });
    } catch (error) {
      this.logger.error(`AI job failed: ${jobId}`, error as Error);
      await this.prisma.aiGenerationJob.update({
        where: { id: jobId },
        data: {
          status: AiJobStatus.failed,
          errorMessage: (error as Error).message,
        },
      });
    }
  }

  private async generateStorePlan(input: { prompt: string; inputImages: unknown[] }) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      return this.fallbackResult(input.prompt);
    }

    const model = this.configService.get<string>('GEMINI_MODEL', 'gemini-1.5-flash');
    const instruction = `You are a strict JSON generator for ecommerce store setup. Return only JSON matching this shape:\n{
  "hero": {"title": string, "subtitle": string},
  "products": [{"title": string, "price": number, "stock": number}],
  "sections": string[]
}\nInput prompt: ${input.prompt}\nInput images count: ${input.inputImages.length}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: instruction }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Gemini returned empty response');
    }

    const cleaned = this.stripCodeFence(rawText);
    const parsed = JSON.parse(cleaned) as unknown;
    return aiResultSchema.parse(parsed);
  }

  private fallbackResult(prompt: string) {
    return aiResultSchema.parse({
      hero: {
        title: 'AI Generated Store Hero',
        subtitle: `Generated from prompt: ${prompt.slice(0, 80)}`,
      },
      products: [
        {
          title: 'Generated Product 1',
          price: 49.99,
          stock: 20,
        },
      ],
      sections: ['trending', 'categories', 'best-selling', 'about', 'contact'],
    });
  }

  private stripCodeFence(text: string) {
    return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  }
}
