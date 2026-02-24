import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { CustomersService } from './customers.service';

class CustomerListQueryDto {
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

@Controller('api/stores/:id/customers')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  list(@Param('id') storeId: string, @Query() query: CustomerListQueryDto) {
    return this.customersService.list(storeId, query);
  }

  @Get(':email/orders')
  orders(@Param('id') storeId: string, @Param('email') email: string) {
    return this.customersService.orders(storeId, decodeURIComponent(email));
  }
}
