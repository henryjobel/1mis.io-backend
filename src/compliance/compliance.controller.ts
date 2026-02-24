import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { ComplianceService } from './compliance.service';

class GdprRequestDto {
  @IsOptional()
  @IsString()
  note?: string;
}

class ListGdprRequestsQueryDto {
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
}

@Controller('api/stores/:id/compliance')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('gdpr/export')
  requestExport(
    @Param('id') storeId: string,
    @Body() dto: GdprRequestDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.complianceService.requestExport(storeId, dto.note, user);
  }

  @Post('gdpr/delete-request')
  requestDelete(
    @Param('id') storeId: string,
    @Body() dto: GdprRequestDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.complianceService.requestDelete(storeId, dto.note, user);
  }

  @Get('requests')
  requests(
    @Param('id') storeId: string,
    @Query() query: ListGdprRequestsQueryDto,
  ) {
    return this.complianceService.requests(storeId, query.page, query.limit);
  }
}

