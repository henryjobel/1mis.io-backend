import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { OrdersService } from './orders.service';

class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}

@Controller('api/stores/:id/orders')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  list(@Param('id') storeId: string) {
    return this.ordersService.list(storeId);
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
