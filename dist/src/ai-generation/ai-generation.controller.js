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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiGenerationController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const store_access_guard_1 = require("../common/guards/store-access.guard");
const ai_generation_service_1 = require("./ai-generation.service");
class GenerateAiDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateAiDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GenerateAiDto.prototype, "inputImages", void 0);
class ApplyAiJobDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ApplyAiJobDto.prototype, "replaceProducts", void 0);
class SavePromptDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SavePromptDto.prototype, "prompt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SavePromptDto.prototype, "title", void 0);
let AiGenerationController = class AiGenerationController {
    constructor(aiGenerationService) {
        this.aiGenerationService = aiGenerationService;
    }
    generate(storeId, user, dto) {
        return this.aiGenerationService.createJob({
            storeId,
            requestedBy: user.id,
            prompt: dto.prompt,
            inputImagesJson: dto.inputImages,
        });
    }
    getJob(storeId, jobId) {
        return this.aiGenerationService.getJob(storeId, jobId);
    }
    getJobResult(storeId, jobId) {
        return this.aiGenerationService.getJobResult(storeId, jobId);
    }
    applyJobResult(storeId, jobId, user, dto) {
        return this.aiGenerationService.applyJobResult(storeId, jobId, user, {
            replaceProducts: dto.replaceProducts ?? false,
        });
    }
    prompts(storeId) {
        return this.aiGenerationService.listPrompts(storeId);
    }
    savePrompt(storeId, dto, user) {
        return this.aiGenerationService.savePrompt(storeId, dto, user);
    }
    replayPrompt(storeId, promptId, user) {
        return this.aiGenerationService.replayPrompt(storeId, promptId, user);
    }
};
exports.AiGenerationController = AiGenerationController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, GenerateAiDto]),
    __metadata("design:returntype", void 0)
], AiGenerationController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)('jobs/:jobId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiGenerationController.prototype, "getJob", null);
__decorate([
    (0, common_1.Get)('jobs/:jobId/result'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiGenerationController.prototype, "getJobResult", null);
__decorate([
    (0, common_1.Post)('jobs/:jobId/apply'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('jobId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, ApplyAiJobDto]),
    __metadata("design:returntype", void 0)
], AiGenerationController.prototype, "applyJobResult", null);
__decorate([
    (0, common_1.Get)('prompts'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiGenerationController.prototype, "prompts", null);
__decorate([
    (0, common_1.Post)('prompts'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SavePromptDto, Object]),
    __metadata("design:returntype", void 0)
], AiGenerationController.prototype, "savePrompt", null);
__decorate([
    (0, common_1.Post)('prompts/:promptId/replay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('promptId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AiGenerationController.prototype, "replayPrompt", null);
exports.AiGenerationController = AiGenerationController = __decorate([
    (0, common_1.Controller)('api/stores/:id/ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, store_access_guard_1.StoreAccessGuard),
    __metadata("design:paramtypes", [ai_generation_service_1.AiGenerationService])
], AiGenerationController);
//# sourceMappingURL=ai-generation.controller.js.map