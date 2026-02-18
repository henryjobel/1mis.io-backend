import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { StoreStatus } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { StoresService } from './stores.service';

class CreateStoreDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  themePreset?: string;
}

class UpdateStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  themePreset?: string;

  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;
}

class UpdateTrackingDto {
  @IsOptional()
  @IsString()
  pixelId?: string;

  @IsOptional()
  @IsString()
  gtmId?: string;

  @IsOptional()
  @IsString()
  capiToken?: string;
}

class UpdateThemeDto {
  @IsOptional()
  @IsString()
  preset?: string;

  @IsOptional()
  @IsObject()
  customJson?: Record<string, unknown>;
}

@Controller('api/stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateStoreDto) {
    return this.storesService.create(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.storesService.list(user);
  }

  @UseGuards(StoreAccessGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @UseGuards(StoreAccessGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStoreDto, @CurrentUser() user: RequestUser) {
    return this.storesService.update(id, dto, user);
  }

  @UseGuards(StoreAccessGuard)
  @Post(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.storesService.publish(id, user);
  }

  @UseGuards(StoreAccessGuard)
  @Patch(':id/tracking')
  updateTracking(@Param('id') id: string, @Body() dto: UpdateTrackingDto, @CurrentUser() user: RequestUser) {
    return this.storesService.upsertTracking(id, dto, user);
  }

  @UseGuards(StoreAccessGuard)
  @Patch(':id/theme')
  updateTheme(@Param('id') id: string, @Body() dto: UpdateThemeDto, @CurrentUser() user: RequestUser) {
    return this.storesService.upsertTheme(id, dto, user);
  }
}
