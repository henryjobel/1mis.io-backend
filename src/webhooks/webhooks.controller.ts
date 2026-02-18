import { Body, Controller, Headers, Post } from '@nestjs/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { WebhooksService } from './webhooks.service';

class WebhookPayloadDto {
  @IsString()
  source!: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsObject()
  payload!: Record<string, unknown>;
}

@Controller('api/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('meta')
  meta(
    @Body() dto: WebhookPayloadDto,
    @Headers('x-webhook-secret') secret?: string,
  ) {
    return this.webhooksService.receive('meta', dto, secret);
  }

  @Post('gtm')
  gtm(
    @Body() dto: WebhookPayloadDto,
    @Headers('x-webhook-secret') secret?: string,
  ) {
    return this.webhooksService.receive('gtm', dto, secret);
  }
}
