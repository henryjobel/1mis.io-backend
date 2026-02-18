import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiJobStatus, Prisma, Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { AuditService } from '../common/audit.service';
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
    private readonly auditService: AuditService,
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
        inputImagesJson: params.inputImagesJson as
          | Prisma.InputJsonValue
          | undefined,
        status: AiJobStatus.queued,
      },
    });

    await this.queueService.enqueueAiJob(job.id);

    return job;
  }

  async getJob(storeId: string, jobId: string) {
    const job = await this.prisma.aiGenerationJob.findFirst({
      where: { id: jobId, storeId },
    });
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

  async applyJobResult(
    storeId: string,
    jobId: string,
    actor: { id: string; role: Role },
    options: { replaceProducts: boolean },
  ) {
    const job = await this.getJob(storeId, jobId);
    if (job.status !== AiJobStatus.completed || !job.resultJson) {
      throw new BadRequestException('AI job is not completed yet');
    }

    const parsed = aiResultSchema.parse(job.resultJson);

    const result = await this.prisma.$transaction(async (tx) => {
      const themeConfig = await tx.themeConfig.upsert({
        where: { storeId },
        create: {
          storeId,
          preset: 'ai-generated',
          customJson: {
            hero: parsed.hero,
            sections: parsed.sections,
            lastAiJobId: job.id,
            generatedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
        update: {
          preset: 'ai-generated',
          customJson: {
            hero: parsed.hero,
            sections: parsed.sections,
            lastAiJobId: job.id,
            generatedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });

      await tx.store.update({
        where: { id: storeId },
        data: {
          themePreset: 'ai-generated',
          status: 'active',
          publishedAt: new Date(),
        },
      });

      if (options.replaceProducts) {
        await tx.product.deleteMany({ where: { storeId } });
      }

      const createdProducts = [];
      for (const item of parsed.products) {
        const product = await tx.product.create({
          data: {
            storeId,
            title: item.title,
            description: `AI generated from job ${job.id}`,
            price: item.price,
            stock: item.stock,
            status: 'active',
          },
        });
        createdProducts.push(product);
      }

      await tx.platformSetting.upsert({
        where: { key: `store_content:${storeId}` },
        create: {
          key: `store_content:${storeId}`,
          valueJson: {
            hero: parsed.hero,
            sections: parsed.sections,
            sourceJobId: job.id,
          } as Prisma.InputJsonValue,
        },
        update: {
          valueJson: {
            hero: parsed.hero,
            sections: parsed.sections,
            sourceJobId: job.id,
          } as Prisma.InputJsonValue,
        },
      });

      return {
        themeConfig,
        createdProductsCount: createdProducts.length,
        sections: parsed.sections,
      };
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'ai.job.apply',
      entityType: 'AiGenerationJob',
      entityId: job.id,
      metaJson: {
        storeId,
        replaceProducts: options.replaceProducts,
        createdProductsCount: result.createdProductsCount,
      },
    });

    return {
      jobId: job.id,
      applied: true,
      ...result,
    };
  }

  async listPrompts(storeId: string) {
    const rows = await this.prisma.platformSetting.findMany({
      where: { key: { startsWith: `ai_prompt:${storeId}:` } },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    return rows.map((row) => {
      const payload = row.valueJson as Record<string, unknown>;
      return {
        id: row.key.replace(`ai_prompt:${storeId}:`, ''),
        ...(payload ?? {}),
      };
    });
  }

  async savePrompt(
    storeId: string,
    data: { prompt: string; title?: string },
    actor: { id: string; role: Role },
  ) {
    const promptId = randomUUID();
    const payload = {
      title: data.title ?? `Prompt ${new Date().toISOString()}`,
      prompt: data.prompt,
      createdBy: actor.id,
      createdAt: new Date().toISOString(),
    };

    const saved = await this.prisma.platformSetting.create({
      data: {
        key: `ai_prompt:${storeId}:${promptId}`,
        valueJson: payload as Prisma.InputJsonValue,
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'ai.prompt.save',
      entityType: 'PlatformSetting',
      entityId: saved.key,
      metaJson: { storeId, promptId },
    });

    return { id: promptId, ...payload };
  }

  async replayPrompt(
    storeId: string,
    promptId: string,
    actor: { id: string; role: Role },
  ) {
    const row = await this.prisma.platformSetting.findUnique({
      where: { key: `ai_prompt:${storeId}:${promptId}` },
    });
    if (!row) throw new NotFoundException('Prompt not found');
    const payload = row.valueJson as { prompt?: string; title?: string } | null;
    if (!payload?.prompt)
      throw new BadRequestException('Prompt payload invalid');

    const job = await this.createJob({
      storeId,
      requestedBy: actor.id,
      prompt: payload.prompt,
      inputImagesJson: [],
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'ai.prompt.replay',
      entityType: 'AiGenerationJob',
      entityId: job.id,
      metaJson: { storeId, promptId },
    });

    return {
      jobId: job.id,
      promptId,
      title: payload.title ?? null,
    };
  }

  private async processJob(jobId: string) {
    await this.prisma.aiGenerationJob.update({
      where: { id: jobId },
      data: { status: AiJobStatus.running },
    });

    try {
      const job = await this.prisma.aiGenerationJob.findUnique({
        where: { id: jobId },
      });
      if (!job) throw new Error('Job not found');

      const result = await this.generateStorePlan({
        prompt: job.prompt,
        inputImages: Array.isArray(job.inputImagesJson)
          ? job.inputImagesJson
          : [],
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

  private async generateStorePlan(input: {
    prompt: string;
    inputImages: unknown[];
  }) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      return this.fallbackResult(input.prompt);
    }

    const model = this.configService.get<string>(
      'GEMINI_MODEL',
      'gemini-1.5-flash',
    );
    const projectName = this.configService.get<string>('GEMINI_PROJECT_NAME');
    const projectId = this.configService.get<string>('GEMINI_PROJECT_ID');

    const instruction = `You are a strict JSON generator for ecommerce store setup. Return only JSON matching this shape:\n{
  "hero": {"title": string, "subtitle": string},
  "products": [{"title": string, "price": number, "stock": number}],
  "sections": string[]
}\nProject: ${projectName ?? 'n/a'} (${projectId ?? 'n/a'})\nInput prompt: ${input.prompt}\nInput images count: ${input.inputImages.length}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers,
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
        const body = await response.text();
        this.logger.warn(
          `Gemini unavailable (${response.status}), using fallback result. ${body.slice(0, 300)}`,
        );
        return this.fallbackResult(input.prompt);
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        this.logger.warn('Gemini returned empty response, using fallback result');
        return this.fallbackResult(input.prompt);
      }

      const cleaned = this.stripCodeFence(rawText);
      const parsed = JSON.parse(cleaned) as unknown;
      return aiResultSchema.parse(parsed);
    } catch (error) {
      this.logger.warn(
        `Gemini request error, using fallback result: ${(error as Error).message}`,
      );
      return this.fallbackResult(input.prompt);
    }
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
    return text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
  }
}
