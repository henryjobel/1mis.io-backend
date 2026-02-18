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
        const projectNumber = this.configService.get('GEMINI_PROJECT_NUMBER');
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
        if (projectNumber) {
            headers['x-goog-user-project'] = projectNumber;
        }
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
            throw new Error(`Gemini API failed: ${response.status} ${body}`);
        }
        const data = (await response.json());
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
            throw new Error('Gemini returned empty response');
        }
        const cleaned = this.stripCodeFence(rawText);
        const parsed = JSON.parse(cleaned);
        return aiResultSchema.parse(parsed);
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