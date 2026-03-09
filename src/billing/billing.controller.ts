import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { BillingService } from './billing.service';

class RenewSubscriptionDto {
  @IsOptional()
  @IsString()
  planKey?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  months?: number;
}

class InitSslCommerzDto {
  @IsOptional()
  @IsString()
  planKey?: string;
}

class CancelSubscriptionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

class SubscriptionListQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

class SslCommerzSubscriptionWebhookDto {
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountBdt?: number;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

@Controller()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Get('api/plans')
  plans() {
    return this.billingService.listPlans();
  }

  @UseGuards(JwtAuthGuard, StoreAccessGuard)
  @Get('api/stores/:id/subscription')
  storeSubscription(@Param('id') storeId: string) {
    return this.billingService.storeSubscription(storeId);
  }

  @UseGuards(JwtAuthGuard, StoreAccessGuard)
  @Get('api/stores/:id/subscription/invoices')
  storeSubscriptionInvoices(
    @Param('id') storeId: string,
    @Query() query: SubscriptionListQueryDto,
  ) {
    return this.billingService.listSubscriptionInvoices(storeId, query);
  }

  @UseGuards(JwtAuthGuard, StoreAccessGuard)
  @Get('api/stores/:id/subscription/events')
  storeSubscriptionEvents(
    @Param('id') storeId: string,
    @Query() query: SubscriptionListQueryDto,
  ) {
    return this.billingService.listSubscriptionPaymentEvents(storeId, query);
  }

  @UseGuards(JwtAuthGuard, StoreAccessGuard)
  @Post('api/stores/:id/subscription/renew')
  renew(
    @Param('id') storeId: string,
    @Body() dto: RenewSubscriptionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.billingService.renewSubscription(storeId, user, dto);
  }

  @UseGuards(JwtAuthGuard, StoreAccessGuard)
  @Post('api/stores/:id/subscription/sslcommerz/init')
  initSslCommerz(
    @Param('id') storeId: string,
    @Body() dto: InitSslCommerzDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.billingService.initSslCommerz(storeId, user, dto);
  }

  @UseGuards(JwtAuthGuard, StoreAccessGuard)
  @Post('api/stores/:id/subscription/cancel')
  cancelSubscription(
    @Param('id') storeId: string,
    @Body() dto: CancelSubscriptionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.billingService.cancelSubscription(storeId, user, dto.reason);
  }

  @Post('api/webhooks/sslcommerz/subscription')
  sslCommerzSubscriptionWebhook(
    @Body() dto: SslCommerzSubscriptionWebhookDto,
    @Headers('x-webhook-secret') secret?: string,
    @Query('webhookToken') webhookToken?: string,
  ) {
    return this.billingService.handleSslCommerzSubscriptionWebhook(
      dto,
      secret ?? webhookToken,
    );
  }

  @Post('api/webhooks/sslcommerz/subscription/ipn')
  sslCommerzSubscriptionIpn(
    @Body() payload: Record<string, unknown>,
    @Headers('x-webhook-secret') secret?: string,
    @Query('webhookToken') webhookToken?: string,
  ) {
    return this.billingService.handleSslCommerzProviderCallback(
      payload,
      secret ?? webhookToken,
      {
        source: 'ipn',
      },
    );
  }

  @Post('api/webhooks/sslcommerz/subscription/success')
  sslCommerzSubscriptionSuccessPost(
    @Body() payload: Record<string, unknown>,
    @Headers('x-webhook-secret') secret?: string,
    @Query('webhookToken') webhookToken?: string,
  ) {
    return this.billingService.handleSslCommerzProviderCallback(
      payload,
      secret ?? webhookToken,
      {
        forcedStatus: 'paid',
        source: 'success',
      },
    );
  }

  @Get('api/webhooks/sslcommerz/subscription/success')
  async sslCommerzSubscriptionSuccessGet(
    @Query() payload: Record<string, unknown>,
    @Res() res: Response,
    @Headers('x-webhook-secret') secret?: string,
    @Query('webhookToken') webhookToken?: string,
  ) {
    const result =
      (await this.billingService.handleSslCommerzProviderCallback(
        payload,
        secret ?? webhookToken,
        {
          forcedStatus: 'paid',
          source: 'success',
        },
      )) as Record<string, unknown>;
    return res.redirect(
      this.billingService.buildOwnerBillingRedirectUrl(
        'success',
        payload,
        result,
      ),
    );
  }

  @Post('api/webhooks/sslcommerz/subscription/fail')
  sslCommerzSubscriptionFailPost(
    @Body() payload: Record<string, unknown>,
    @Headers('x-webhook-secret') secret?: string,
    @Query('webhookToken') webhookToken?: string,
  ) {
    return this.billingService.handleSslCommerzProviderCallback(
      payload,
      secret ?? webhookToken,
      {
        forcedStatus: 'failed',
        source: 'fail',
      },
    );
  }

  @Get('api/webhooks/sslcommerz/subscription/fail')
  async sslCommerzSubscriptionFailGet(
    @Query() payload: Record<string, unknown>,
    @Res() res: Response,
    @Headers('x-webhook-secret') secret?: string,
    @Query('webhookToken') webhookToken?: string,
  ) {
    const result =
      (await this.billingService.handleSslCommerzProviderCallback(
        payload,
        secret ?? webhookToken,
        {
          forcedStatus: 'failed',
          source: 'fail',
        },
      )) as Record<string, unknown>;
    return res.redirect(
      this.billingService.buildOwnerBillingRedirectUrl(
        'failed',
        payload,
        result,
      ),
    );
  }

  @Post('api/webhooks/sslcommerz/subscription/cancel')
  sslCommerzSubscriptionCancelPost(
    @Body() payload: Record<string, unknown>,
    @Headers('x-webhook-secret') secret?: string,
    @Query('webhookToken') webhookToken?: string,
  ) {
    return this.billingService.handleSslCommerzProviderCallback(
      payload,
      secret ?? webhookToken,
      {
        forcedStatus: 'cancelled',
        source: 'cancel',
      },
    );
  }

  @Get('api/webhooks/sslcommerz/subscription/cancel')
  async sslCommerzSubscriptionCancelGet(
    @Query() payload: Record<string, unknown>,
    @Res() res: Response,
    @Headers('x-webhook-secret') secret?: string,
    @Query('webhookToken') webhookToken?: string,
  ) {
    const result =
      (await this.billingService.handleSslCommerzProviderCallback(
        payload,
        secret ?? webhookToken,
        {
          forcedStatus: 'cancelled',
          source: 'cancel',
        },
      )) as Record<string, unknown>;
    return res.redirect(
      this.billingService.buildOwnerBillingRedirectUrl(
        'cancelled',
        payload,
        result,
      ),
    );
  }

  @Get('api/webhooks/sslcommerz/subscription/mock/:invoiceId')
  sslCommerzSubscriptionMock(
    @Param('invoiceId') invoiceId: string,
    @Query('status') status?: string,
  ) {
    const normalized = String(status ?? 'paid').trim().toLowerCase();
    if (normalized === 'failed') {
      return this.billingService.mockSslCommerzSubscriptionResult(
        invoiceId,
        'failed',
      );
    }
    if (normalized === 'cancelled') {
      return this.billingService.mockSslCommerzSubscriptionResult(
        invoiceId,
        'cancelled',
      );
    }
    return this.billingService.mockSslCommerzSubscriptionResult(invoiceId, 'paid');
  }
}
