import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { OrdersService } from './orders.service';

class UpdateOrderStatusDto {
  @IsString()
  status!: string;
}

class OrdersListQueryDto {
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

@Controller('api/stores/:id/orders')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Param('id') storeId: string, @Query() query: OrdersListQueryDto) {
    return this.ordersService.list(storeId, query);
  }

  @Get(':orderId')
  findOne(@Param('id') storeId: string, @Param('orderId') orderId: string) {
    return this.ordersService.findOne(storeId, orderId);
  }

  @Patch(':orderId/status')
  updateStatus(
    @Param('id') storeId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.ordersService.updateStatus(storeId, orderId, dto.status, user);
  }
}
