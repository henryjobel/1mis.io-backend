import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { CustomersService } from './customers.service';

@Controller('api/stores/:id/customers')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list(@Param('id') storeId: string) {
    return this.customersService.list(storeId);
  }

  @Get(':email/orders')
  orders(@Param('id') storeId: string, @Param('email') email: string) {
    return this.customersService.orders(storeId, decodeURIComponent(email));
  }
}
