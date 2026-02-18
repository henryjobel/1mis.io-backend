import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { PromotionsService } from './promotions.service';

class CouponDto {
  @IsString()
  code!: string;

  @IsString()
  type!: 'flat' | 'percent';

  @Type(() => Number)
  @IsNumber()
  value!: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  maxDiscount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class TaxRuleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @Type(() => Number)
  @IsNumber()
  rate!: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('api/stores/:id/promotions')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get('coupons')
  coupons(@Param('id') storeId: string) {
    return this.promotionsService.listCoupons(storeId);
  }

  @Post('coupons')
  createCoupon(
    @Param('id') storeId: string,
    @Body() dto: CouponDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.promotionsService.createCoupon(storeId, dto, user);
  }

  @Patch('coupons/:couponId')
  updateCoupon(
    @Param('id') storeId: string,
    @Param('couponId') couponId: string,
    @Body() dto: Partial<CouponDto>,
    @CurrentUser() user: RequestUser,
  ) {
    return this.promotionsService.updateCoupon(storeId, couponId, dto, user);
  }

  @Delete('coupons/:couponId')
  deleteCoupon(
    @Param('id') storeId: string,
    @Param('couponId') couponId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.promotionsService.deleteCoupon(storeId, couponId, user);
  }

  @Get('tax-rules')
  taxRules(@Param('id') storeId: string) {
    return this.promotionsService.listTaxRules(storeId);
  }

  @Post('tax-rules')
  createTaxRule(
    @Param('id') storeId: string,
    @Body() dto: TaxRuleDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.promotionsService.createTaxRule(storeId, dto, user);
  }

  @Patch('tax-rules/:taxRuleId')
  updateTaxRule(
    @Param('id') storeId: string,
    @Param('taxRuleId') taxRuleId: string,
    @Body() dto: Partial<TaxRuleDto>,
    @CurrentUser() user: RequestUser,
  ) {
    return this.promotionsService.updateTaxRule(storeId, taxRuleId, dto, user);
  }

  @Delete('tax-rules/:taxRuleId')
  deleteTaxRule(
    @Param('id') storeId: string,
    @Param('taxRuleId') taxRuleId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.promotionsService.deleteTaxRule(storeId, taxRuleId, user);
  }
}
