import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { DashboardService } from './dashboard.service';

@Controller('api/stores/:id/dashboard')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  overview(@Param('id') storeId: string) {
    return this.dashboardService.overview(storeId);
  }
}

