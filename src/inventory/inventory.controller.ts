import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { InventoryService } from './inventory.service';

class InventoryQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  threshold?: number;

  @IsOptional()
  @IsIn(['true', 'false', '1', '0'])
  includeVariants?: string;
}

@Controller('api/stores/:id/inventory')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('summary')
  summary(@Param('id') storeId: string, @Query() query: InventoryQueryDto) {
    return this.inventoryService.summary(storeId, query.threshold);
  }

  @Get('low-stock')
  lowStock(@Param('id') storeId: string, @Query() query: InventoryQueryDto) {
    const includeVariants =
      query.includeVariants === 'true' || query.includeVariants === '1';
    return this.inventoryService.lowStock(storeId, {
      threshold: query.threshold,
      includeVariants,
    });
  }
}

