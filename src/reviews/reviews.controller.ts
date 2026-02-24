import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsBoolean,
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
import { ReviewsService } from './reviews.service';

class UpdateReviewApprovalDto {
  @IsBoolean()
  isApproved!: boolean;
}

class ReviewListQueryDto {
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

@Controller('api/stores/:id/reviews')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  list(@Param('id') storeId: string, @Query() query: ReviewListQueryDto) {
    return this.reviewsService.list(storeId, query);
  }

  @Patch(':reviewId/approve')
  approve(
    @Param('id') storeId: string,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewApprovalDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.reviewsService.approve(storeId, reviewId, dto.isApproved, user);
  }

  @Delete(':reviewId')
  remove(
    @Param('id') storeId: string,
    @Param('reviewId') reviewId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.reviewsService.remove(storeId, reviewId, user);
  }
}
