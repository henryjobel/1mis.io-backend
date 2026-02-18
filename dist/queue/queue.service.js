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
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
let QueueService = QueueService_1 = class QueueService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(QueueService_1.name);
    }
    async onModuleInit() {
        const host = this.configService.get('REDIS_HOST');
        const port = this.configService.get('REDIS_PORT');
        if (!host || !port) {
            this.logger.warn('Redis config missing. Queue runs in fallback mode.');
            return;
        }
        try {
            const connection = { host, port };
            this.queue = new bullmq_1.Queue('ai-generation', { connection });
            this.worker = new bullmq_1.Worker('ai-generation', async (job) => {
                if (!this.aiProcessor)
                    return;
                await this.aiProcessor(job.data.jobId);
            }, { connection });
            this.logger.log('BullMQ queue initialized');
        }
        catch (error) {
            this.logger.warn(`Queue init failed, fallback mode enabled: ${error.message}`);
        }
    }
    async onModuleDestroy() {
        await this.worker?.close();
        await this.queue?.close();
    }
    registerAiProcessor(processor) {
        this.aiProcessor = processor;
    }
    async enqueueAiJob(jobId, opts) {
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
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QueueService);
//# sourceMappingURL=queue.service.js.map