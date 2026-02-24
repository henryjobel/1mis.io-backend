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
  IsArray,
  IsBoolean,
  IsInt,
  IsDateString,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { ShippingService } from './shipping.service';

class ShippingRateDto {
  @IsString()
  name!: string;

  @IsString()
  country!: string;

  @Type(() => Number)
  @IsNumber()
  amount!: number;
}

class ShippingMethodsDto {
  @IsOptional()
  @IsBoolean()
  standard?: boolean;

  @IsOptional()
  @IsBoolean()
  express?: boolean;

  @IsOptional()
  @IsBoolean()
  pickup?: boolean;

  @IsOptional()
  @IsBoolean()
  cod?: boolean;
}

class ShippingChargesDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  flatCharge?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  expressCharge?: number;
}

class ShippingConfigDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingMethodsDto)
  methods?: ShippingMethodsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingChargesDto)
  charges?: ShippingChargesDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingRateDto)
  rates?: ShippingRateDto[];
}

class ShipOrderDto {
  @IsString()
  orderId!: string;

  @IsString()
  courier!: string;

  @IsString()
  trackingNumber!: string;

  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;
}

class TrackingStatusDto {
  @IsString()
  status!: string;
}

class ShippingListQueryDto {
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
  @IsString()
  sort?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}

@Controller('api/stores/:id/shipping')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Get('config')
  config(@Param('id') storeId: string) {
    return this.shippingService.getConfig(storeId);
  }

  @Patch('config')
  upsertConfig(
    @Param('id') storeId: string,
    @Body() dto: ShippingConfigDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.shippingService.upsertConfig(storeId, dto, user);
  }

  @Post('ship')
  shipOrder(
    @Param('id') storeId: string,
    @Body() dto: ShipOrderDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.shippingService.shipOrder(storeId, dto, user);
  }

  @Patch('tracking/:shipmentId')
  updateTracking(
    @Param('id') storeId: string,
    @Param('shipmentId') shipmentId: string,
    @Body() dto: TrackingStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.shippingService.updateTracking(
      storeId,
      shipmentId,
      dto.status,
      user,
    );
  }

  @Get('shipments')
  shipments(
    @Param('id') storeId: string,
    @Query() query: ShippingListQueryDto,
  ) {
    return this.shippingService.shipments(storeId, query);
  }

  @Get('orders')
  orders(@Param('id') storeId: string, @Query() query: ShippingListQueryDto) {
    return this.shippingService.orders(storeId, query);
  }

  @Get('shipments/:shipmentId')
  shipment(@Param('id') storeId: string, @Param('shipmentId') shipmentId: string) {
    return this.shippingService.shipment(storeId, shipmentId);
  }
}
