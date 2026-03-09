import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { QueueModule } from '../queue/queue.module';
import { AiGenerationController } from './ai-generation.controller';
import { AiGenerationService } from './ai-generation.service';

@Module({
  imports: [QueueModule, BillingModule],
  controllers: [AiGenerationController],
  providers: [AiGenerationService],
})
export class AiGenerationModule {}
