import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { MediaService } from './media.service';

class CreateMediaDto {
  @IsString()
  type!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  altText?: string;
}

@Controller('api/stores/:id/media')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  list(@Param('id') storeId: string) {
    return this.mediaService.list(storeId);
  }

  @Post()
  upload(
    @Param('id') storeId: string,
    @Body() dto: CreateMediaDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.mediaService.upload(storeId, dto, user);
  }

  @Delete(':assetId')
  remove(
    @Param('id') storeId: string,
    @Param('assetId') assetId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.mediaService.remove(storeId, assetId, user);
  }
}
