import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
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

class CreateMediaUploadSessionDto {
  @IsString()
  type!: string;

  @IsString()
  filename!: string;

  @IsString()
  mimeType!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5 * 1024 * 1024)
  sizeBytes!: number;

  @IsOptional()
  @IsString()
  altText?: string;
}

class CompleteMediaUploadDto {
  @IsString()
  uploadId!: string;

  @IsOptional()
  @IsUrl()
  url?: string;

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

  @Post('presign')
  createUploadSession(
    @Param('id') storeId: string,
    @Body() dto: CreateMediaUploadSessionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.mediaService.createUploadSession(storeId, dto, user);
  }

  @Post('complete')
  completeUpload(
    @Param('id') storeId: string,
    @Body() dto: CompleteMediaUploadDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.mediaService.completeUpload(storeId, dto, user);
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
