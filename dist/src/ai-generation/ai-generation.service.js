"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiGenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiGenerationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
const aiResultSchema = zod_1.z.object({
    hero: zod_1.z.object({
        title: zod_1.z.string(),
        subtitle: zod_1.z.string(),
    }),
    products: zod_1.z
        .array(zod_1.z.object({
        title: zod_1.z.string(),
        price: zod_1.z.number(),
        stock: zod_1.z.number().int().nonnegative(),
    }))
        .min(1),
    sections: zod_1.z.array(zod_1.z.string()).min(1),
});
let AiGenerationService = AiGenerationService_1 = class AiGenerationService {
    constructor(prisma, queueService, configService, auditService) {
        this.prisma = prisma;
        this.queueService = queueService;
        this.configService = configService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(AiGenerationService_1.name);
    }
    onModuleInit() {
        this.queueService.registerAiProcessor(async (jobId) => {
            await this.processJob(jobId);
        });
    }
    async createJob(params) {
        const job = await this.prisma.aiGenerationJob.create({
            data: {
                storeId: params.storeId,
                requestedBy: params.requestedBy,
                prompt: params.prompt,
                inputImagesJson: params.inputImagesJson,
                status: client_1.AiJobStatus.queued,
            },
        });
        await this.queueService.enqueueAiJob(job.id);
        return job;
    }
    async getJob(storeId, jobId) {
        const job = await this.prisma.aiGenerationJob.findFirst({
            where: { id: jobId, storeId },
        });
        if (!job)
            throw new common_1.NotFoundException('AI job not found');
        return job;
    }
    async getJobResult(storeId, jobId) {
        const job = await this.getJob(storeId, jobId);
        return {
            id: job.id,
            status: job.status,
            result: job.resultJson,
            errorMessage: job.errorMessage,
        };
    }
    async applyJobResult(storeId, jobId, actor, options) {
        const job = await this.getJob(storeId, jobId);
        if (job.status !== client_1.AiJobStatus.completed || !job.resultJson) {
            throw new common_1.BadRequestException('AI job is not completed yet');
        }
        const parsed = aiResultSchema.parse(job.resultJson);
        const historyId = (0, crypto_1.randomUUID)();
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
                throw new common_1.NotFoundException('Store not found');
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
                    },
                },
                update: {
                    preset: 'ai-generated',
                    customJson: {
                        hero: parsed.hero,
                        sections: parsed.sections,
                        lastAiJobId: job.id,
                        generatedAt: new Date().toISOString(),
                    },
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
                    },
                },
                update: {
                    valueJson: {
                        hero: parsed.hero,
                        sections: parsed.sections,
                        sourceJobId: job.id,
                    },
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
                    },
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
    async history(storeId) {
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
    async undoLatest(storeId, actor, reason) {
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
            throw new common_1.NotFoundException('No undo history found');
        }
        const historyId = row.key.replace(`ai_history:${storeId}:`, '');
        return this.revertHistory(storeId, historyId, actor, reason ?? 'undo_latest');
    }
    async revertHistory(storeId, historyId, actor, reason) {
        const key = `ai_history:${storeId}:${historyId}`;
        const row = await this.prisma.platformSetting.findUnique({ where: { key } });
        if (!row)
            throw new common_1.NotFoundException('History item not found');
        const payload = this.asRecord(row.valueJson);
        const storeBefore = this.asRecord(payload.storeBefore);
        const themeBeforeRaw = payload.themeBefore;
        const contentBeforeExists = this.asBoolean(payload.contentBeforeExists, false);
        const contentBefore = payload.contentBefore;
        await this.prisma.$transaction(async (tx) => {
            if (themeBeforeRaw && typeof themeBeforeRaw === 'object') {
                const themeBefore = this.asRecord(themeBeforeRaw);
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
            }
            else {
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
            }
            else {
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
                data: { valueJson: nextPayload },
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
    async applySectionPrompt(storeId, data, actor) {
        const section = data.section.trim().toLowerCase();
        const prompt = data.prompt.trim();
        if (!section) {
            throw new common_1.BadRequestException('section is required');
        }
        if (!prompt) {
            throw new common_1.BadRequestException('prompt is required');
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
        const historyId = (0, crypto_1.randomUUID)();
        const historyKey = `ai_section_history:${storeId}:${historyId}`;
        const nowIso = new Date().toISOString();
        await this.prisma.$transaction(async (tx) => {
            await tx.platformSetting.upsert({
                where: { key: contentKey },
                create: {
                    key: contentKey,
                    valueJson: preview,
                },
                update: {
                    valueJson: preview,
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
                    },
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
    async sectionHistory(storeId) {
        const rows = await this.prisma.platformSetting.findMany({
            where: { key: { startsWith: `ai_section_history:${storeId}:` } },
            orderBy: { updatedAt: 'desc' },
            take: 200,
        });
        return rows.map((row) => {
            const payload = this.asRecord(row.valueJson);
            return {
                id: this.asString(payload.id, row.key.replace(`ai_section_history:${storeId}:`, '')),
                storeId,
                section: this.asString(payload.section, 'unknown'),
                prompt: this.asString(payload.prompt, ''),
                createdAt: this.asString(payload.createdAt, row.updatedAt.toISOString()),
                appliedBy: this.asString(payload.appliedBy, 'unknown'),
                reverted: Boolean(payload.revertedAt),
                revertedAt: this.asString(payload.revertedAt, ''),
                revertReason: this.asString(payload.revertReason, ''),
                patch: this.asRecord(payload.patch),
                preview: this.asRecord(payload.after),
            };
        });
    }
    async revertSectionHistory(storeId, historyId, actor, reason) {
        const key = `ai_section_history:${storeId}:${historyId}`;
        const row = await this.prisma.platformSetting.findUnique({ where: { key } });
        if (!row)
            throw new common_1.NotFoundException('Section history item not found');
        const payload = this.asRecord(row.valueJson);
        const contentKey = `store_content:${storeId}`;
        const beforeExists = this.asBoolean(payload.beforeExists, false);
        const before = payload.before;
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
            }
            else {
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
                    },
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
    async listPrompts(storeId) {
        const rows = await this.prisma.platformSetting.findMany({
            where: { key: { startsWith: `ai_prompt:${storeId}:` } },
            orderBy: { updatedAt: 'desc' },
            take: 200,
        });
        return rows.map((row) => {
            const payload = row.valueJson;
            return {
                id: row.key.replace(`ai_prompt:${storeId}:`, ''),
                ...(payload ?? {}),
            };
        });
    }
    async savePrompt(storeId, data, actor) {
        const promptId = (0, crypto_1.randomUUID)();
        const payload = {
            title: data.title ?? `Prompt ${new Date().toISOString()}`,
            prompt: data.prompt,
            createdBy: actor.id,
            createdAt: new Date().toISOString(),
        };
        const saved = await this.prisma.platformSetting.create({
            data: {
                key: `ai_prompt:${storeId}:${promptId}`,
                valueJson: payload,
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
    async replayPrompt(storeId, promptId, actor) {
        const row = await this.prisma.platformSetting.findUnique({
            where: { key: `ai_prompt:${storeId}:${promptId}` },
        });
        if (!row)
            throw new common_1.NotFoundException('Prompt not found');
        const payload = row.valueJson;
        if (!payload?.prompt)
            throw new common_1.BadRequestException('Prompt payload invalid');
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
    async processJob(jobId) {
        await this.prisma.aiGenerationJob.update({
            where: { id: jobId },
            data: { status: client_1.AiJobStatus.running },
        });
        try {
            const job = await this.prisma.aiGenerationJob.findUnique({
                where: { id: jobId },
            });
            if (!job)
                throw new Error('Job not found');
            const result = await this.generateStorePlan({
                prompt: job.prompt,
                inputImages: Array.isArray(job.inputImagesJson)
                    ? job.inputImagesJson
                    : [],
            });
            await this.prisma.aiGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: client_1.AiJobStatus.completed,
                    resultJson: result,
                    errorMessage: null,
                },
            });
        }
        catch (error) {
            this.logger.error(`AI job failed: ${jobId}`, error);
            await this.prisma.aiGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: client_1.AiJobStatus.failed,
                    errorMessage: error.message,
                },
            });
        }
    }
    async generateStorePlan(input) {
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            return this.fallbackResult(input.prompt);
        }
        const model = this.configService.get('GEMINI_MODEL', 'gemini-1.5-flash');
        const projectName = this.configService.get('GEMINI_PROJECT_NAME');
        const projectId = this.configService.get('GEMINI_PROJECT_ID');
        const instruction = `You are a strict JSON generator for ecommerce store setup. Return only JSON matching this shape:\n{
  "hero": {"title": string, "subtitle": string},
  "products": [{"title": string, "price": number, "stock": number}],
  "sections": string[]
}\nProject: ${projectName ?? 'n/a'} (${projectId ?? 'n/a'})\nInput prompt: ${input.prompt}\nInput images count: ${input.inputImages.length}`;
        const headers = {
            'Content-Type': 'application/json',
        };
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    contents: [{ parts: [{ text: instruction }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1024,
                    },
                }),
            });
            if (!response.ok) {
                const body = await response.text();
                this.logger.warn(`Gemini unavailable (${response.status}), using fallback result. ${body.slice(0, 300)}`);
                return this.fallbackResult(input.prompt);
            }
            const data = (await response.json());
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) {
                this.logger.warn('Gemini returned empty response, using fallback result');
                return this.fallbackResult(input.prompt);
            }
            const cleaned = this.stripCodeFence(rawText);
            const parsed = JSON.parse(cleaned);
            return aiResultSchema.parse(parsed);
        }
        catch (error) {
            this.logger.warn(`Gemini request error, using fallback result: ${error.message}`);
            return this.fallbackResult(input.prompt);
        }
    }
    fallbackResult(prompt) {
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
    stripCodeFence(text) {
        return text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
    }
    generateSectionPatch(section, prompt, current) {
        const sectionState = this.asRecord(current[section]);
        const nowIso = new Date().toISOString();
        const inferredTitle = this.extractQuotedValue(prompt);
        if (section === 'hero') {
            return {
                hero: {
                    ...sectionState,
                    title: inferredTitle ||
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
    applySectionPatch(current, patch) {
        const next = { ...current };
        for (const [key, value] of Object.entries(patch)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const existing = this.asRecord(current[key]);
                next[key] = {
                    ...existing,
                    ...value,
                };
            }
            else {
                next[key] = value;
            }
        }
        return next;
    }
    extractQuotedValue(prompt) {
        const match = prompt.match(/"([^"]+)"/) ??
            prompt.match(/'([^']+)'/) ??
            prompt.match(/`([^`]+)`/);
        return match?.[1]?.trim() || null;
    }
    asRecord(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return {};
        }
        return value;
    }
    asString(value, fallback) {
        if (typeof value !== 'string')
            return fallback;
        const next = value.trim();
        return next || fallback;
    }
    asBoolean(value, fallback) {
        if (typeof value === 'boolean')
            return value;
        if (value === 'true')
            return true;
        if (value === 'false')
            return false;
        return fallback;
    }
    nullableString(value) {
        if (value == null)
            return null;
        if (typeof value !== 'string')
            return null;
        const next = value.trim();
        return next || null;
    }
    nullableDate(value) {
        if (!value)
            return null;
        if (value instanceof Date)
            return value;
        if (typeof value !== 'string')
            return null;
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    asJsonValue(value) {
        if (value === undefined) {
            return {};
        }
        if (value === null) {
            return client_1.Prisma.JsonNull;
        }
        return value;
    }
    toStoreStatus(value) {
        const raw = String(value ?? '')
            .trim()
            .toLowerCase();
        if (raw === 'active')
            return client_1.StoreStatus.active;
        if (raw === 'suspended')
            return client_1.StoreStatus.suspended;
        if (raw === 'archived')
            return client_1.StoreStatus.archived;
        return client_1.StoreStatus.draft;
    }
};
exports.AiGenerationService = AiGenerationService;
exports.AiGenerationService = AiGenerationService = AiGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService,
        config_1.ConfigService,
        audit_service_1.AuditService])
], AiGenerationService);
//# sourceMappingURL=ai-generation.service.js.map