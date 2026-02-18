import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { AiGenerationService } from './ai-generation.service';

class GenerateAiDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsArray()
  inputImages?: string[];
}

class ApplyAiJobDto {
  @IsOptional()
  @IsBoolean()
  replaceProducts?: boolean;
}

class SavePromptDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  title?: string;
}

@Controller('api/stores/:id/ai')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class AiGenerationController {
  constructor(private readonly aiGenerationService: AiGenerationService) {}

  @Post('generate')
  generate(
    @Param('id') storeId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: GenerateAiDto,
  ) {
    return this.aiGenerationService.createJob({
      storeId,
      requestedBy: user.id,
      prompt: dto.prompt,
      inputImagesJson: dto.inputImages,
    });
  }

  @Get('jobs/:jobId')
  getJob(@Param('id') storeId: string, @Param('jobId') jobId: string) {
    return this.aiGenerationService.getJob(storeId, jobId);
  }

  @Get('jobs/:jobId/result')
  getJobResult(@Param('id') storeId: string, @Param('jobId') jobId: string) {
    return this.aiGenerationService.getJobResult(storeId, jobId);
  }

  @Post('jobs/:jobId/apply')
  applyJobResult(
    @Param('id') storeId: string,
    @Param('jobId') jobId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ApplyAiJobDto,
  ) {
    return this.aiGenerationService.applyJobResult(storeId, jobId, user, {
      replaceProducts: dto.replaceProducts ?? false,
    });
  }

  @Get('prompts')
  prompts(@Param('id') storeId: string) {
    return this.aiGenerationService.listPrompts(storeId);
  }

  @Post('prompts')
  savePrompt(
    @Param('id') storeId: string,
    @Body() dto: SavePromptDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.aiGenerationService.savePrompt(storeId, dto, user);
  }

  @Post('prompts/:promptId/replay')
  replayPrompt(
    @Param('id') storeId: string,
    @Param('promptId') promptId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.aiGenerationService.replayPrompt(storeId, promptId, user);
  }
}
