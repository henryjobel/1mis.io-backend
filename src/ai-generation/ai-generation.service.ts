import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiJobStatus, Prisma, Role, StoreStatus } from '@prisma/client';
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
    const historyId = randomUUID();

    const result = await this.prisma.$transaction(async (tx) => {
      const [storeBefore, themeBefore, contentBefore] = await Promise.all([
        tx.store.findUnique({
          where: { id: storeId },
          select: {
            status: true,
            themePreset: true,
            publishedAt: true,
          },
        }),
        tx.themeConfig.findUnique({
          where: { storeId },
          select: { preset: true, customJson: true },
        }),
        tx.platformSetting.findUnique({
          where: { key: `store_content:${storeId}` },
          select: { valueJson: true },
        }),
      ]);
      if (!storeBefore) {
        throw new NotFoundException('Store not found');
      }

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

      await tx.platformSetting.create({
        data: {
          key: `ai_history:${storeId}:${historyId}`,
          valueJson: {
            id: historyId,
            storeId,
            jobId: job.id,
            createdAt: new Date().toISOString(),
            appliedBy: actor.id,
            replaceProducts: options.replaceProducts,
            themeBefore: themeBefore
              ? {
                  preset: themeBefore.preset,
                  customJson: themeBefore.customJson,
                }
              : null,
            contentBefore: contentBefore?.valueJson ?? null,
            contentBeforeExists: Boolean(contentBefore),
            storeBefore: {
              status: storeBefore.status,
              themePreset: storeBefore.themePreset,
              publishedAt: storeBefore.publishedAt
                ? storeBefore.publishedAt.toISOString()
                : null,
            },
            themeAfter: {
              preset: themeConfig.preset,
              customJson: themeConfig.customJson,
            },
            contentAfter: {
              hero: parsed.hero,
              sections: parsed.sections,
              sourceJobId: job.id,
            },
            revertedAt: null,
            revertedBy: null,
            revertReason: null,
          } as Prisma.InputJsonValue,
        },
      });

      return {
        themeConfig,
        createdProductsCount: createdProducts.length,
        sections: parsed.sections,
        historyId,
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

  async history(storeId: string) {
    const rows = await this.prisma.platformSetting.findMany({
      where: { key: { startsWith: `ai_history:${storeId}:` } },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    return rows.map((row) => {
      const payload = this.asRecord(row.valueJson);
      return {
        id: this.asString(payload.id, row.key.replace(`ai_history:${storeId}:`, '')),
        storeId,
        jobId: this.asString(payload.jobId, ''),
        createdAt: this.asString(payload.createdAt, row.updatedAt.toISOString()),
        appliedBy: this.asString(payload.appliedBy, 'unknown'),
        replaceProducts: this.asBoolean(payload.replaceProducts, false),
        reverted: Boolean(payload.revertedAt),
        revertedAt: this.asString(payload.revertedAt, ''),
        revertReason: this.asString(payload.revertReason, ''),
      };
    });
  }

  async undoLatest(
    storeId: string,
    actor: { id: string; role: Role },
    reason?: string,
  ) {
    const rows = await this.prisma.platformSetting.findMany({
      where: { key: { startsWith: `ai_history:${storeId}:` } },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
    const row = rows.find((item) => {
      const payload = this.asRecord(item.valueJson);
      return !payload.revertedAt;
    });
    if (!row) {
      throw new NotFoundException('No undo history found');
    }
    const historyId = row.key.replace(`ai_history:${storeId}:`, '');
    return this.revertHistory(storeId, historyId, actor, reason ?? 'undo_latest');
  }

  async revertHistory(
    storeId: string,
    historyId: string,
    actor: { id: string; role: Role },
    reason?: string,
  ) {
    const key = `ai_history:${storeId}:${historyId}`;
    const row = await this.prisma.platformSetting.findUnique({ where: { key } });
    if (!row) throw new NotFoundException('History item not found');

    const payload = this.asRecord(row.valueJson);
    const storeBefore = this.asRecord(payload.storeBefore as Prisma.JsonValue);
    const themeBeforeRaw = payload.themeBefore;
    const contentBeforeExists = this.asBoolean(payload.contentBeforeExists, false);
    const contentBefore = payload.contentBefore as Prisma.JsonValue | null;

    await this.prisma.$transaction(async (tx) => {
      if (themeBeforeRaw && typeof themeBeforeRaw === 'object') {
        const themeBefore = this.asRecord(themeBeforeRaw as Prisma.JsonValue);
        await tx.themeConfig.upsert({
          where: { storeId },
          create: {
            storeId,
            preset: this.nullableString(themeBefore.preset),
            customJson: this.asJsonValue(themeBefore.customJson),
          },
          update: {
            preset: this.nullableString(themeBefore.preset),
            customJson: this.asJsonValue(themeBefore.customJson),
          },
        });
      } else {
        await tx.themeConfig.deleteMany({ where: { storeId } });
      }

      if (contentBeforeExists) {
        await tx.platformSetting.upsert({
          where: { key: `store_content:${storeId}` },
          create: {
            key: `store_content:${storeId}`,
            valueJson: this.asJsonValue(contentBefore),
          },
          update: {
            valueJson: this.asJsonValue(contentBefore),
          },
        });
      } else {
        await tx.platformSetting.deleteMany({
          where: { key: `store_content:${storeId}` },
        });
      }

      await tx.store.update({
        where: { id: storeId },
        data: {
          status: this.toStoreStatus(storeBefore.status),
          themePreset: this.nullableString(storeBefore.themePreset),
          publishedAt: this.nullableDate(storeBefore.publishedAt),
        },
      });

      const nextPayload = {
        ...payload,
        revertedAt: new Date().toISOString(),
        revertedBy: actor.id,
        revertReason: reason ?? null,
      };
      await tx.platformSetting.update({
        where: { key },
        data: { valueJson: nextPayload as Prisma.InputJsonValue },
      });
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'ai.history.revert',
      entityType: 'PlatformSetting',
      entityId: key,
      metaJson: { storeId, historyId },
    });

    return {
      storeId,
      historyId,
      reverted: true,
      revertedAt: new Date().toISOString(),
    };
  }

  async applySectionPrompt(
    storeId: string,
    data: { section: string; prompt: string; dryRun?: boolean },
    actor: { id: string; role: Role },
  ) {
    const section = data.section.trim().toLowerCase();
    const prompt = data.prompt.trim();
    if (!section) {
      throw new BadRequestException('section is required');
    }
    if (!prompt) {
      throw new BadRequestException('prompt is required');
    }

    const contentKey = `store_content:${storeId}`;
    const contentRow = await this.prisma.platformSetting.findUnique({
      where: { key: contentKey },
    });

    const current = this.asRecord(contentRow?.valueJson);
    const patch = this.generateSectionPatch(section, prompt, current);
    const preview = this.applySectionPatch(current, patch);
    const dryRun = data.dryRun ?? false;

    if (dryRun) {
      return {
        section,
        prompt,
        dryRun: true,
        persisted: false,
        historyId: null,
        patch,
        preview,
      };
    }

    const historyId = randomUUID();
    const historyKey = `ai_section_history:${storeId}:${historyId}`;
    const nowIso = new Date().toISOString();

    await this.prisma.$transaction(async (tx) => {
      await tx.platformSetting.upsert({
        where: { key: contentKey },
        create: {
          key: contentKey,
          valueJson: preview as Prisma.InputJsonValue,
        },
        update: {
          valueJson: preview as Prisma.InputJsonValue,
        },
      });

      await tx.platformSetting.create({
        data: {
          key: historyKey,
          valueJson: {
            id: historyId,
            storeId,
            section,
            prompt,
            dryRun: false,
            createdAt: nowIso,
            appliedBy: actor.id,
            beforeExists: Boolean(contentRow),
            before: contentRow?.valueJson ?? null,
            patch,
            after: preview,
            revertedAt: null,
            revertedBy: null,
            revertReason: null,
          } as Prisma.InputJsonValue,
        },
      });
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'ai.sections.apply',
      entityType: 'PlatformSetting',
      entityId: historyKey,
      metaJson: { storeId, section },
    });

    return {
      section,
      prompt,
      dryRun: false,
      persisted: true,
      historyId,
      patch,
      preview,
    };
  }

  async sectionHistory(storeId: string) {
    const rows = await this.prisma.platformSetting.findMany({
      where: { key: { startsWith: `ai_section_history:${storeId}:` } },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    return rows.map((row) => {
      const payload = this.asRecord(row.valueJson);
      return {
        id: this.asString(
          payload.id,
          row.key.replace(`ai_section_history:${storeId}:`, ''),
        ),
        storeId,
        section: this.asString(payload.section, 'unknown'),
        prompt: this.asString(payload.prompt, ''),
        createdAt: this.asString(payload.createdAt, row.updatedAt.toISOString()),
        appliedBy: this.asString(payload.appliedBy, 'unknown'),
        reverted: Boolean(payload.revertedAt),
        revertedAt: this.asString(payload.revertedAt, ''),
        revertReason: this.asString(payload.revertReason, ''),
        patch: this.asRecord(payload.patch as Prisma.JsonValue | undefined),
        preview: this.asRecord(payload.after as Prisma.JsonValue | undefined),
      };
    });
  }

  async revertSectionHistory(
    storeId: string,
    historyId: string,
    actor: { id: string; role: Role },
    reason?: string,
  ) {
    const key = `ai_section_history:${storeId}:${historyId}`;
    const row = await this.prisma.platformSetting.findUnique({ where: { key } });
    if (!row) throw new NotFoundException('Section history item not found');

    const payload = this.asRecord(row.valueJson);
    const contentKey = `store_content:${storeId}`;
    const beforeExists = this.asBoolean(payload.beforeExists, false);
    const before = payload.before as Prisma.JsonValue | undefined;
    const nowIso = new Date().toISOString();

    await this.prisma.$transaction(async (tx) => {
      if (beforeExists) {
        await tx.platformSetting.upsert({
          where: { key: contentKey },
          create: {
            key: contentKey,
            valueJson: this.asJsonValue(before),
          },
          update: {
            valueJson: this.asJsonValue(before),
          },
        });
      } else {
        await tx.platformSetting.deleteMany({
          where: { key: contentKey },
        });
      }

      await tx.platformSetting.update({
        where: { key },
        data: {
          valueJson: {
            ...payload,
            revertedAt: nowIso,
            revertedBy: actor.id,
            revertReason: reason ?? null,
          } as Prisma.InputJsonValue,
        },
      });
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'ai.sections.history.revert',
      entityType: 'PlatformSetting',
      entityId: key,
      metaJson: { storeId, historyId },
    });

    return {
      storeId,
      historyId,
      reverted: true,
      revertedAt: nowIso,
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

  private generateSectionPatch(
    section: string,
    prompt: string,
    current: Record<string, unknown>,
  ) {
    const sectionState = this.asRecord(
      current[section] as Prisma.JsonValue | undefined,
    );
    const nowIso = new Date().toISOString();
    const inferredTitle = this.extractQuotedValue(prompt);

    if (section === 'hero') {
      return {
        hero: {
          ...sectionState,
          title:
            inferredTitle ||
            this.asString(sectionState.title, '') ||
            prompt.slice(0, 120),
          aiPrompt: prompt,
          updatedAt: nowIso,
        },
      };
    }

    return {
      [section]: {
        ...sectionState,
        aiPrompt: prompt,
        aiSummary: inferredTitle ?? prompt,
        updatedAt: nowIso,
      },
    };
  }

  private applySectionPatch(
    current: Record<string, unknown>,
    patch: Record<string, unknown>,
  ) {
    const next: Record<string, unknown> = { ...current };

    for (const [key, value] of Object.entries(patch)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const existing = this.asRecord(
          current[key] as Prisma.JsonValue | undefined,
        );
        next[key] = {
          ...existing,
          ...(value as Record<string, unknown>),
        };
      } else {
        next[key] = value;
      }
    }

    return next;
  }

  private extractQuotedValue(prompt: string) {
    const match =
      prompt.match(/"([^"]+)"/) ??
      prompt.match(/'([^']+)'/) ??
      prompt.match(/`([^`]+)`/);
    return match?.[1]?.trim() || null;
  }

  private asRecord(
    value: Prisma.JsonValue | null | undefined,
  ): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private asString(value: unknown, fallback: string) {
    if (typeof value !== 'string') return fallback;
    const next = value.trim();
    return next || fallback;
  }

  private asBoolean(value: unknown, fallback: boolean) {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return fallback;
  }

  private nullableString(value: unknown): string | null {
    if (value == null) return null;
    if (typeof value !== 'string') return null;
    const next = value.trim();
    return next || null;
  }

  private nullableDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value !== 'string') return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private asJsonValue(value: unknown): Prisma.InputJsonValue {
    if (value === undefined) {
      return {} as Prisma.InputJsonValue;
    }
    if (value === null) {
      return Prisma.JsonNull as unknown as Prisma.InputJsonValue;
    }
    return value as Prisma.InputJsonValue;
  }

  private toStoreStatus(value: unknown): StoreStatus {
    const raw = String(value ?? '')
      .trim()
      .toLowerCase();
    if (raw === 'active') return StoreStatus.active;
    if (raw === 'suspended') return StoreStatus.suspended;
    if (raw === 'archived') return StoreStatus.archived;
    return StoreStatus.draft;
  }
}
