import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module';
import { AiGenerationController } from './ai-generation.controller';
import { AiGenerationService } from './ai-generation.service';

@Module({
  imports: [QueueModule],
  controllers: [AiGenerationController],
  providers: [AiGenerationService],
})
export class AiGenerationModule {}
