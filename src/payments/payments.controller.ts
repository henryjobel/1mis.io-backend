import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { PaymentsService } from './payments.service';

class PaymentIntentDto {
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

class ConfirmPaymentDto {
  @IsString()
  transactionId!: string;

  @IsString()
  providerRef!: string;

  @IsOptional()
  @IsString()
  status?: string;
}

class RefundPaymentDto {
  @IsString()
  transactionId!: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  amount?: number;
}

class PaymentConfigDto {
  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  key?: string;
}

class PaymentTransactionListQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}

@Controller('api/stores/:id/payments')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('config')
  config(@Param('id') storeId: string) {
    return this.paymentsService.getConfig(storeId);
  }

  @Patch('config')
  upsertConfig(
    @Param('id') storeId: string,
    @Body() dto: PaymentConfigDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.paymentsService.upsertConfig(
      storeId,
      dto as unknown as Record<string, unknown>,
      user,
    );
  }

  @Post('intent')
  intent(
    @Param('id') storeId: string,
    @Body() dto: PaymentIntentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.paymentsService.createIntent(storeId, dto, user);
  }

  @Post('confirm')
  confirm(
    @Param('id') storeId: string,
    @Body() dto: ConfirmPaymentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.paymentsService.confirm(storeId, dto, user);
  }

  @Post('refund')
  refund(
    @Param('id') storeId: string,
    @Body() dto: RefundPaymentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.paymentsService.refund(storeId, dto, user);
  }

  @Get('transactions')
  transactions(
    @Param('id') storeId: string,
    @Query() query: PaymentTransactionListQueryDto,
  ) {
    return this.paymentsService.transactions(storeId, query);
  }

  @Get('transactions/:transactionId')
  transaction(
    @Param('id') storeId: string,
    @Param('transactionId') transactionId: string,
  ) {
    return this.paymentsService.transaction(storeId, transactionId);
  }
}
