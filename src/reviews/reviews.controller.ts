import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { ReviewsService } from './reviews.service';

class UpdateReviewApprovalDto {
  @IsBoolean()
  isApproved!: boolean;
}

@Controller('api/stores/:id/reviews')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  list(@Param('id') storeId: string) {
    return this.reviewsService.list(storeId);
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
