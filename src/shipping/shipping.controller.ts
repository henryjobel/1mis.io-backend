import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
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

class ShippingConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingRateDto)
  rates!: ShippingRateDto[];
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
  shipments(@Param('id') storeId: string) {
    return this.shippingService.shipments(storeId);
  }
}
