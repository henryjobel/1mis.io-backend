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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const queue_service_1 = require("../queue/queue.service");
let AiGenerationService = AiGenerationService_1 = class AiGenerationService {
    constructor(prisma, queueService) {
        this.prisma = prisma;
        this.queueService = queueService;
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
        const job = await this.prisma.aiGenerationJob.findFirst({ where: { id: jobId, storeId } });
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
    async processJob(jobId) {
        await this.prisma.aiGenerationJob.update({
            where: { id: jobId },
            data: { status: client_1.AiJobStatus.running },
        });
        try {
            const job = await this.prisma.aiGenerationJob.findUnique({ where: { id: jobId } });
            if (!job)
                throw new Error('Job not found');
            const fakeResult = {
                hero: {
                    title: 'AI Generated Store Hero',
                    subtitle: 'Generated from prompt with production-ready sections',
                },
                products: [
                    {
                        title: 'Generated Product 1',
                        price: 49.99,
                        stock: 20,
                    },
                ],
                sections: ['trending', 'categories', 'best-selling', 'about', 'contact'],
            };
            await this.prisma.aiGenerationJob.update({
                where: { id: jobId },
                data: {
                    status: client_1.AiJobStatus.completed,
                    resultJson: fakeResult,
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
};
exports.AiGenerationService = AiGenerationService;
exports.AiGenerationService = AiGenerationService = AiGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        queue_service_1.QueueService])
], AiGenerationService);
//# sourceMappingURL=ai-generation.service.js.map