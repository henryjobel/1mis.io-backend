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
const sectionNames = [
    'hero',
    'header',
    'product-card',
    'footer',
    'buttons',
    'domain',
    'site',
];
const themePresetValues = ['aurora', 'sand', 'slate'];
const cardStyleValues = ['minimal', 'bordered', 'shadow', 'gradient'];
const buttonRadiusValues = ['soft', 'pill', 'square'];
const promoBannerToneValues = ['accent', 'primary', 'mixed'];
const themePalette = {
    aurora: {
        primaryColor: '#0f766e',
        accentColor: '#f97316',
        backgroundColor: '#f5f7fb',
        surfaceColor: '#ffffff',
        textColor: '#0f172a',
        mutedTextColor: '#475569',
    },
    sand: {
        primaryColor: '#9a3412',
        accentColor: '#0284c7',
        backgroundColor: '#faf6ed',
        surfaceColor: '#fffdf7',
        textColor: '#3f2f24',
        mutedTextColor: '#6b5a50',
    },
    slate: {
        primaryColor: '#e2e8f0',
        accentColor: '#22d3ee',
        backgroundColor: '#0f172a',
        surfaceColor: '#1e293b',
        textColor: '#f8fafc',
        mutedTextColor: '#cbd5e1',
    },
};
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
        if (!sectionNames.includes(section)) {
            throw new common_1.BadRequestException(`section must be one of: ${sectionNames.join(', ')}`);
        }
        if (!prompt) {
            throw new common_1.BadRequestException('prompt is required');
        }
        const contentKey = `store_content:${storeId}`;
        const contentRow = await this.prisma.platformSetting.findUnique({
            where: { key: contentKey },
        });
        const current = this.asRecord(contentRow?.valueJson);
        const patch = await this.generateSectionPatch(section, prompt, current);
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
    async generateSectionPatch(section, prompt, current) {
        if (section === 'site') {
            return this.generateFullSitePatch(prompt, current);
        }
        const sectionState = this.asRecord(current[section]);
        const nowIso = new Date().toISOString();
        const inferredTitle = this.extractQuotedValue(prompt);
        let sectionPatch = await this.generateSectionPatchFromGemini(section, prompt, sectionState);
        if (!sectionPatch || !Object.keys(sectionPatch).length) {
            sectionPatch = this.generateSectionPatchFallback(section, prompt, sectionState);
        }
        const summary = this.asString(sectionPatch.aiSummary, '') ||
            inferredTitle ||
            prompt.slice(0, 180);
        return {
            [section]: {
                ...sectionState,
                ...sectionPatch,
                aiPrompt: prompt,
                aiSummary: summary,
                updatedAt: nowIso,
            },
        };
    }
    async generateFullSitePatch(prompt, current) {
        let sitePatch = await this.generateFullSitePatchFromGemini(prompt, current);
        if (!sitePatch || !Object.keys(sitePatch).length) {
            sitePatch = this.generateFullSitePatchFallback(prompt, current);
        }
        const nowIso = new Date().toISOString();
        const sharedSummary = this.asString(sitePatch.aiSummary, '') || prompt.slice(0, 180);
        const next = {};
        for (const sectionName of sectionNames) {
            if (sectionName === 'site')
                continue;
            const partial = this.asUnknownRecord(sitePatch[sectionName]);
            if (!Object.keys(partial).length)
                continue;
            const currentSectionState = this.asRecord(current[sectionName]);
            const sectionSummary = this.asString(partial.aiSummary, '') || sharedSummary;
            next[sectionName] = {
                ...currentSectionState,
                ...partial,
                aiPrompt: prompt,
                aiSummary: sectionSummary,
                updatedAt: nowIso,
            };
        }
        if (!Object.keys(next).length) {
            const fallbackTitle = this.extractQuotedValue(prompt) ||
                `Store Update: ${prompt.slice(0, 90)}`;
            const currentHero = this.asRecord(current.hero);
            next.hero = {
                ...currentHero,
                title: fallbackTitle,
                subtitle: this.asString(currentHero.subtitle, '') ||
                    'Store updated from full-site prompt.',
                aiPrompt: prompt,
                aiSummary: sharedSummary || 'Updated site from one prompt.',
                updatedAt: nowIso,
            };
        }
        return next;
    }
    async generateFullSitePatchFromGemini(prompt, current) {
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            return null;
        }
        const model = this.configService.get('GEMINI_MODEL', 'gemini-1.5-flash');
        const instruction = `You convert one prompt into a full ecommerce site patch. Return only JSON with this shape:\n{\n  "summary": "short summary",\n  "hero": {"title":"string","subtitle":"string","bannerImage":"string|null","promoBannerEnabled":true,"promoBannerTitle":"string","promoBannerSubtitle":"string","promoBannerCta":"string","promoBannerTone":"accent|primary|mixed","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"},\n  "header": {"logoText":"string","announcementText":"string","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"},\n  "product-card": {"cardStyle":"minimal|bordered|shadow|gradient","trendingTitle":"string","categoriesTitle":"string","bestSellingTitle":"string","allProductsTitle":"string","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"},\n  "footer": {"aboutTitle":"string","aboutDescription":"string","contactTitle":"string","contactEmail":"string","contactPhone":"string","contactAddress":"string","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"},\n  "buttons": {"buttonRadius":"soft|pill|square","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"},\n  "domain": {"customDomain":"string","hostedSubdomain":"string","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"}\n}\nCurrent store content JSON: ${JSON.stringify(current)}\nUser prompt: ${prompt}\nRules:\n- Include only fields that should change.\n- Keep text concise and practical.\n- Never include markdown or explanation text.`;
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: instruction }] }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 1400,
                    },
                }),
            });
            if (!response.ok) {
                const body = await response.text();
                this.logger.warn(`Gemini full-site patch failed (${response.status}): ${body.slice(0, 250)}`);
                return null;
            }
            const data = (await response.json());
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) {
                return null;
            }
            const parsedRaw = JSON.parse(this.stripCodeFence(rawText));
            const parsed = this.asUnknownRecord(parsedRaw);
            const payload = this.asUnknownRecord(parsed.patch);
            const source = Object.keys(payload).length ? payload : parsed;
            const summary = this.asString(parsed.summary, '');
            const next = {};
            for (const sectionName of sectionNames) {
                if (sectionName === 'site')
                    continue;
                const sectionInput = this.resolveSectionRecord(source, sectionName);
                const sanitized = this.sanitizeSectionPatch(sectionName, sectionInput);
                if (!Object.keys(sanitized).length)
                    continue;
                if (summary) {
                    sanitized.aiSummary = summary.slice(0, 220);
                }
                next[sectionName] = sanitized;
            }
            if (summary) {
                next.aiSummary = summary.slice(0, 220);
            }
            return next;
        }
        catch (error) {
            this.logger.warn(`Gemini full-site patch parse error: ${error.message}`);
            return null;
        }
    }
    generateFullSitePatchFallback(prompt, current) {
        const next = {};
        for (const sectionName of sectionNames) {
            if (sectionName === 'site')
                continue;
            const sectionState = this.asRecord(current[sectionName]);
            const fallbackPatch = this.generateSectionPatchFallback(sectionName, prompt, sectionState);
            if (Object.keys(fallbackPatch).length) {
                next[sectionName] = fallbackPatch;
            }
        }
        if (!Object.keys(next).length) {
            const looksLikeFullSitePrompt = /(full|whole|entire|complete|all|puro|sob|overall)/i.test(prompt) &&
                /(site|website|store)/i.test(prompt);
            if (looksLikeFullSitePrompt) {
                next.hero = this.sanitizeSectionPatch('hero', {
                    title: this.extractQuotedValue(prompt) || 'AI Crafted Storefront',
                    subtitle: 'Complete site customized from your prompt.',
                });
                const domain = this.extractDomain(prompt);
                if (domain) {
                    next.domain = this.sanitizeSectionPatch('domain', {
                        customDomain: domain,
                    });
                }
            }
        }
        next.aiSummary = 'Full site update applied from one prompt.';
        return next;
    }
    resolveSectionRecord(source, section) {
        if (section === 'product-card') {
            const byDash = this.asUnknownRecord(source['product-card']);
            if (Object.keys(byDash).length)
                return byDash;
            const byUnderscore = this.asUnknownRecord(source.product_card);
            if (Object.keys(byUnderscore).length)
                return byUnderscore;
            return this.asUnknownRecord(source.productCard);
        }
        return this.asUnknownRecord(source[section]);
    }
    async generateSectionPatchFromGemini(section, prompt, sectionState) {
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            return null;
        }
        const model = this.configService.get('GEMINI_MODEL', 'gemini-1.5-flash');
        const schemaHint = this.sectionSchemaHint(section);
        const instruction = `You convert a user prompt into a strict JSON patch for a single ecommerce dashboard section.\nSection: ${section}\nCurrent section state JSON: ${JSON.stringify(sectionState)}\nUser prompt: ${prompt}\nReturn only JSON with this exact shape:\n{\n  "summary": "short natural summary",\n  "patch": ${schemaHint}\n}\nRules:\n- Return patch fields only for requested updates.\n- Keep values practical for ecommerce.\n- Never include explanations or markdown.\n- If unclear, return empty patch {}.`;
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: instruction }] }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 900,
                    },
                }),
            });
            if (!response.ok) {
                const body = await response.text();
                this.logger.warn(`Gemini section patch failed (${response.status}): ${body.slice(0, 250)}`);
                return null;
            }
            const data = (await response.json());
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) {
                return null;
            }
            const parsedRaw = JSON.parse(this.stripCodeFence(rawText));
            const parsed = this.asUnknownRecord(parsedRaw);
            const patchInput = this.asUnknownRecord(parsed.patch);
            const sanitized = this.sanitizeSectionPatch(section, patchInput);
            const summary = this.asString(parsed.summary, '');
            if (summary) {
                sanitized.aiSummary = summary.slice(0, 220);
            }
            return sanitized;
        }
        catch (error) {
            this.logger.warn(`Gemini section patch parse error: ${error.message}`);
            return null;
        }
    }
    sectionSchemaHint(section) {
        if (section === 'site') {
            return `{"summary":"string","hero":{},"header":{},"product-card":{},"footer":{},"buttons":{},"domain":{}}`;
        }
        if (section === 'hero') {
            return `{"title":"string","subtitle":"string","bannerImage":"string|null","promoBannerEnabled":true,"promoBannerTitle":"string","promoBannerSubtitle":"string","promoBannerCta":"string","promoBannerTone":"accent|primary|mixed","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"}`;
        }
        if (section === 'header') {
            return `{"logoText":"string","announcementText":"string","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"}`;
        }
        if (section === 'product-card') {
            return `{"cardStyle":"minimal|bordered|shadow|gradient","trendingTitle":"string","categoriesTitle":"string","bestSellingTitle":"string","allProductsTitle":"string","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"}`;
        }
        if (section === 'footer') {
            return `{"aboutTitle":"string","aboutDescription":"string","contactTitle":"string","contactEmail":"string","contactPhone":"string","contactAddress":"string","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"}`;
        }
        if (section === 'buttons') {
            return `{"buttonRadius":"soft|pill|square","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"}`;
        }
        return `{"customDomain":"string","hostedSubdomain":"string","themePreset":"aurora|sand|slate","primaryColor":"#hex","accentColor":"#hex","backgroundColor":"#hex","surfaceColor":"#hex","textColor":"#hex","mutedTextColor":"#hex"}`;
    }
    sanitizeSectionPatch(section, source) {
        const patch = {};
        const readString = (key, max = 220) => {
            if (!this.hasOwn(source, key))
                return null;
            const raw = source[key];
            if (typeof raw !== 'string')
                return null;
            const trimmed = raw.trim();
            if (!trimmed)
                return null;
            return trimmed.slice(0, max);
        };
        const readEnum = (key, values) => {
            const value = readString(key, 80)?.toLowerCase();
            if (!value)
                return null;
            return values.includes(value) ? value : null;
        };
        const readBoolean = (key) => {
            if (!this.hasOwn(source, key))
                return null;
            const raw = source[key];
            if (typeof raw === 'boolean')
                return raw;
            if (typeof raw === 'string') {
                const lowered = raw.trim().toLowerCase();
                if (lowered === 'true')
                    return true;
                if (lowered === 'false')
                    return false;
            }
            return null;
        };
        const readColor = (key) => {
            const value = readString(key, 32);
            if (!value)
                return null;
            return this.normalizeColor(value);
        };
        const applySharedStyleFields = () => {
            const theme = readEnum('themePreset', themePresetValues);
            if (theme) {
                patch.themePreset = theme;
                Object.assign(patch, themePalette[theme]);
            }
            const primaryColor = readColor('primaryColor');
            if (primaryColor)
                patch.primaryColor = primaryColor;
            const accentColor = readColor('accentColor');
            if (accentColor)
                patch.accentColor = accentColor;
            const backgroundColor = readColor('backgroundColor');
            if (backgroundColor)
                patch.backgroundColor = backgroundColor;
            const surfaceColor = readColor('surfaceColor');
            if (surfaceColor)
                patch.surfaceColor = surfaceColor;
            const textColor = readColor('textColor');
            if (textColor)
                patch.textColor = textColor;
            const mutedTextColor = readColor('mutedTextColor');
            if (mutedTextColor)
                patch.mutedTextColor = mutedTextColor;
        };
        applySharedStyleFields();
        if (section === 'hero') {
            const title = readString('title', 140);
            if (title)
                patch.title = title;
            const subtitle = readString('subtitle', 220);
            if (subtitle)
                patch.subtitle = subtitle;
            const promoEnabled = readBoolean('promoBannerEnabled');
            if (promoEnabled !== null)
                patch.promoBannerEnabled = promoEnabled;
            const promoTitle = readString('promoBannerTitle', 140);
            if (promoTitle)
                patch.promoBannerTitle = promoTitle;
            const promoSubtitle = readString('promoBannerSubtitle', 220);
            if (promoSubtitle)
                patch.promoBannerSubtitle = promoSubtitle;
            const promoCta = readString('promoBannerCta', 60);
            if (promoCta)
                patch.promoBannerCta = promoCta;
            const promoTone = readEnum('promoBannerTone', promoBannerToneValues);
            if (promoTone)
                patch.promoBannerTone = promoTone;
            if (this.hasOwn(source, 'bannerImage')) {
                const bannerRaw = source.bannerImage;
                if (bannerRaw === null) {
                    patch.bannerImage = null;
                }
                else {
                    const bannerImage = readString('bannerImage', 1200);
                    if (bannerImage)
                        patch.bannerImage = bannerImage;
                }
            }
            return patch;
        }
        if (section === 'header') {
            const logoText = readString('logoText', 80);
            if (logoText)
                patch.logoText = logoText;
            const announcementText = readString('announcementText', 220);
            if (announcementText)
                patch.announcementText = announcementText;
            return patch;
        }
        if (section === 'product-card') {
            const cardStyle = readEnum('cardStyle', cardStyleValues);
            if (cardStyle)
                patch.cardStyle = cardStyle;
            const trendingTitle = readString('trendingTitle', 80);
            if (trendingTitle)
                patch.trendingTitle = trendingTitle;
            const categoriesTitle = readString('categoriesTitle', 80);
            if (categoriesTitle)
                patch.categoriesTitle = categoriesTitle;
            const bestSellingTitle = readString('bestSellingTitle', 80);
            if (bestSellingTitle)
                patch.bestSellingTitle = bestSellingTitle;
            const allProductsTitle = readString('allProductsTitle', 80);
            if (allProductsTitle)
                patch.allProductsTitle = allProductsTitle;
            return patch;
        }
        if (section === 'footer') {
            const aboutTitle = readString('aboutTitle', 90);
            if (aboutTitle)
                patch.aboutTitle = aboutTitle;
            const aboutDescription = readString('aboutDescription', 320);
            if (aboutDescription)
                patch.aboutDescription = aboutDescription;
            const contactTitle = readString('contactTitle', 90);
            if (contactTitle)
                patch.contactTitle = contactTitle;
            const contactEmail = readString('contactEmail', 160);
            if (contactEmail)
                patch.contactEmail = contactEmail;
            const contactPhone = readString('contactPhone', 60);
            if (contactPhone)
                patch.contactPhone = contactPhone;
            const contactAddress = readString('contactAddress', 220);
            if (contactAddress)
                patch.contactAddress = contactAddress;
            return patch;
        }
        if (section === 'buttons') {
            const buttonRadius = readEnum('buttonRadius', buttonRadiusValues);
            if (buttonRadius)
                patch.buttonRadius = buttonRadius;
            const cardStyle = readEnum('cardStyle', cardStyleValues);
            if (cardStyle)
                patch.cardStyle = cardStyle;
            return patch;
        }
        if (this.hasOwn(source, 'customDomain')) {
            const raw = source.customDomain;
            if (typeof raw === 'string') {
                patch.customDomain = raw.trim().toLowerCase();
            }
        }
        if (this.hasOwn(source, 'hostedSubdomain')) {
            const raw = source.hostedSubdomain;
            if (typeof raw === 'string') {
                patch.hostedSubdomain = raw.trim().toLowerCase();
            }
        }
        return patch;
    }
    generateSectionPatchFallback(section, prompt, sectionState) {
        const text = prompt.toLowerCase();
        const patch = {};
        const quotedValue = this.extractQuotedValue(prompt);
        const applyThemeFallback = () => {
            if (text.includes('dark mode') || text.includes('dark theme')) {
                patch.themePreset = 'slate';
                Object.assign(patch, themePalette.slate);
            }
            else if (text.includes('light mode') || text.includes('light theme')) {
                patch.themePreset = 'aurora';
                Object.assign(patch, themePalette.aurora);
            }
            else if (text.includes('sand theme')) {
                patch.themePreset = 'sand';
                Object.assign(patch, themePalette.sand);
            }
            for (const [name, colors] of Object.entries({
                blue: { primaryColor: '#2563eb', accentColor: '#06b6d4' },
                green: { primaryColor: '#15803d', accentColor: '#22c55e' },
                orange: { primaryColor: '#c2410c', accentColor: '#fb923c' },
                red: { primaryColor: '#b91c1c', accentColor: '#f43f5e' },
                teal: { primaryColor: '#0f766e', accentColor: '#2dd4bf' },
                slate: { primaryColor: '#e2e8f0', accentColor: '#38bdf8' },
            })) {
                if (text.includes(name) && (text.includes('theme') || text.includes('color'))) {
                    patch.primaryColor = colors.primaryColor;
                    patch.accentColor = colors.accentColor;
                    break;
                }
            }
        };
        applyThemeFallback();
        if (section === 'hero') {
            if (text.includes('headline') || text.includes('hero title') || text.includes('hero heading') || text.includes('title')) {
                patch.title =
                    quotedValue ||
                        this.extractTailAfterKeyword(prompt, [
                            'headline',
                            'hero title',
                            'hero heading',
                            'title',
                        ]) ||
                        this.asString(sectionState.title, '') ||
                        prompt.slice(0, 140);
            }
            if (text.includes('subtitle') || text.includes('tagline')) {
                patch.subtitle =
                    quotedValue ||
                        this.extractTailAfterKeyword(prompt, ['subtitle', 'tagline']) ||
                        this.asString(sectionState.subtitle, '');
            }
            if (text.includes('add banner') || text.includes('show banner') || text.includes('enable banner')) {
                patch.promoBannerEnabled = true;
            }
            if (text.includes('hide banner') || text.includes('disable banner') || text.includes('remove banner')) {
                patch.promoBannerEnabled = false;
            }
            if ((text.includes('banner title') || text.includes('banner headline')) && quotedValue) {
                patch.promoBannerTitle = quotedValue;
                patch.promoBannerEnabled = true;
            }
            if ((text.includes('banner subtitle') || text.includes('banner text')) && quotedValue) {
                patch.promoBannerSubtitle = quotedValue;
                patch.promoBannerEnabled = true;
            }
            if ((text.includes('banner cta') || text.includes('banner button')) && quotedValue) {
                patch.promoBannerCta = quotedValue;
                patch.promoBannerEnabled = true;
            }
            if (text.includes('banner tone accent')) {
                patch.promoBannerTone = 'accent';
            }
            if (text.includes('banner tone primary')) {
                patch.promoBannerTone = 'primary';
            }
            if (text.includes('banner tone mixed')) {
                patch.promoBannerTone = 'mixed';
            }
        }
        if (section === 'header') {
            if ((text.includes('logo') || text.includes('store name')) && quotedValue) {
                patch.logoText = quotedValue;
            }
            if (text.includes('announcement') && quotedValue) {
                patch.announcementText = quotedValue;
            }
        }
        if (section === 'product-card') {
            if (text.includes('gradient'))
                patch.cardStyle = 'gradient';
            if (text.includes('shadow'))
                patch.cardStyle = 'shadow';
            if (text.includes('minimal'))
                patch.cardStyle = 'minimal';
            if (text.includes('border'))
                patch.cardStyle = 'bordered';
            if ((text.includes('trending title') || text.includes('trending heading')) && quotedValue) {
                patch.trendingTitle = quotedValue;
            }
            if ((text.includes('categories title') || text.includes('category title')) && quotedValue) {
                patch.categoriesTitle = quotedValue;
            }
            if ((text.includes('best selling title') || text.includes('best selling heading')) && quotedValue) {
                patch.bestSellingTitle = quotedValue;
            }
            if ((text.includes('all products title') || text.includes('all products heading')) && quotedValue) {
                patch.allProductsTitle = quotedValue;
            }
        }
        if (section === 'footer') {
            if ((text.includes('about title') || text.includes('about heading')) && quotedValue) {
                patch.aboutTitle = quotedValue;
            }
            if ((text.includes('about description') || text.includes('about text')) && quotedValue) {
                patch.aboutDescription = quotedValue;
            }
            if ((text.includes('contact title') || text.includes('contact heading')) && quotedValue) {
                patch.contactTitle = quotedValue;
            }
            const email = this.extractEmail(prompt);
            if (email)
                patch.contactEmail = email;
            const phone = this.extractPhone(prompt);
            if (phone)
                patch.contactPhone = phone;
            if ((text.includes('address') || text.includes('contact address')) && quotedValue) {
                patch.contactAddress = quotedValue;
            }
        }
        if (section === 'buttons') {
            if (text.includes('pill'))
                patch.buttonRadius = 'pill';
            if (text.includes('square'))
                patch.buttonRadius = 'square';
            if (text.includes('soft') || text.includes('rounded'))
                patch.buttonRadius = 'soft';
        }
        if (section === 'domain') {
            if (text.includes('clear custom domain') || text.includes('remove custom domain')) {
                patch.customDomain = '';
            }
            const domain = this.extractDomain(prompt);
            if (domain) {
                patch.customDomain = domain;
            }
            if (text.includes('hosted subdomain') && quotedValue) {
                patch.hostedSubdomain = quotedValue.toLowerCase();
            }
        }
        return this.sanitizeSectionPatch(section, patch);
    }
    hasOwn(source, key) {
        return Object.prototype.hasOwnProperty.call(source, key);
    }
    asUnknownRecord(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return {};
        }
        return value;
    }
    normalizeColor(value) {
        const trimmed = value.trim();
        if (!trimmed)
            return null;
        if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) {
            return trimmed;
        }
        const map = {
            blue: '#2563eb',
            green: '#16a34a',
            orange: '#ea580c',
            red: '#dc2626',
            teal: '#0f766e',
            cyan: '#0891b2',
            black: '#111827',
            white: '#ffffff',
            gray: '#6b7280',
            grey: '#6b7280',
            purple: '#7c3aed',
            pink: '#db2777',
            yellow: '#ca8a04',
        };
        return map[trimmed.toLowerCase()] ?? null;
    }
    extractEmail(prompt) {
        const match = prompt.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        return match?.[0]?.toLowerCase() ?? null;
    }
    extractPhone(prompt) {
        const match = prompt.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/);
        return match?.[0]?.trim() ?? null;
    }
    extractDomain(prompt) {
        const match = prompt.match(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\b/i);
        return match?.[0]?.toLowerCase() ?? null;
    }
    extractTailAfterKeyword(prompt, keywords) {
        const lowered = prompt.toLowerCase();
        for (const keyword of keywords) {
            const index = lowered.indexOf(keyword);
            if (index < 0)
                continue;
            let tail = prompt
                .slice(index + keyword.length)
                .replace(/^[\s:=-]*(to|as)?\s*/i, '')
                .trim();
            tail = tail.split(/[,.;|]/)[0]?.trim() ?? '';
            tail = tail.replace(/\b(and|then)\b.*$/i, '').trim();
            tail = tail
                .replace(/\b(logo|domain|button|card|footer|header|contact|about|email|phone|cta|banner)\b.*$/i, '')
                .trim();
            tail = tail.replace(/^["'`]+|["'`]+$/g, '').trim();
            if (tail.length >= 3)
                return tail.slice(0, 220);
        }
        return null;
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