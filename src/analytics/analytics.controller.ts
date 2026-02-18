import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { AnalyticsService } from './analytics.service';

@Controller('api/stores/:id/analytics')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  overview(
    @Param('id') storeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.overview(storeId, from, to);
  }

  @Get('top-products')
  topProducts(@Param('id') storeId: string) {
    return this.analyticsService.topProducts(storeId);
  }
}
