import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StoreStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
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

class UpdateMarketingDto {
  @IsOptional()
  @IsString()
  facebookPageId?: string;

  @IsOptional()
  @IsString()
  businessManagerId?: string;

  @IsOptional()
  @IsString()
  adAccountId?: string;

  @IsOptional()
  @IsString()
  catalogId?: string;

  @IsOptional()
  @IsString()
  productFeedUrl?: string;

  @IsOptional()
  @IsString()
  metaPixelId?: string;

  @IsOptional()
  @IsString()
  conversionApiToken?: string;

  @IsOptional()
  @IsString()
  gtmId?: string;

  @IsOptional()
  @IsBoolean()
  isDomainVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isShopConnected?: boolean;

  @IsOptional()
  @IsBoolean()
  isPixelEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isCapiEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isGtmEnabled?: boolean;
}

class ConnectDomainDto {
  @IsString()
  domain!: string;
}

class BuyDomainDto {
  @IsString()
  domain!: string;

  @IsOptional()
  @IsBoolean()
  autoConnect?: boolean;
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
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.storesService.update(id, dto, user);
  }

  @UseGuards(StoreAccessGuard)
  @Post(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.storesService.publish(id, user);
  }

  @UseGuards(StoreAccessGuard)
  @Patch(':id/tracking')
  updateTracking(
    @Param('id') id: string,
    @Body() dto: UpdateTrackingDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.storesService.upsertTracking(id, dto, user);
  }

  @UseGuards(StoreAccessGuard)
  @Patch(':id/theme')
  updateTheme(
    @Param('id') id: string,
    @Body() dto: UpdateThemeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.storesService.upsertTheme(id, dto, user);
  }

  @UseGuards(StoreAccessGuard)
  @Get(':id/marketing')
  getMarketing(@Param('id') id: string) {
    return this.storesService.getMarketing(id);
  }

  @UseGuards(StoreAccessGuard)
  @Patch(':id/marketing')
  upsertMarketing(
    @Param('id') id: string,
    @Body() dto: UpdateMarketingDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.storesService.upsertMarketing(
      id,
      dto as unknown as Record<string, unknown>,
      user,
    );
  }

  @UseGuards(StoreAccessGuard)
  @Get(':id/content')
  getContent(@Param('id') id: string) {
    return this.storesService.getContent(id);
  }

  @UseGuards(StoreAccessGuard)
  @Patch(':id/content')
  upsertContent(
    @Param('id') id: string,
    @Body() dto: Record<string, unknown>,
    @CurrentUser() user: RequestUser,
  ) {
    return this.storesService.upsertContent(
      id,
      dto as unknown as Record<string, unknown>,
      user,
    );
  }

  @UseGuards(StoreAccessGuard)
  @Post(':id/domain/connect')
  connectDomain(
    @Param('id') id: string,
    @Body() dto: ConnectDomainDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.storesService.connectDomain(id, dto.domain, user);
  }

  @UseGuards(StoreAccessGuard)
  @Post(':id/domain/verify')
  verifyDomain(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.storesService.verifyDomain(id, user);
  }

  @UseGuards(StoreAccessGuard)
  @Post(':id/domain/buy')
  buyDomain(
    @Param('id') id: string,
    @Body() dto: BuyDomainDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.storesService.buyDomain(id, dto, user);
  }

  @UseGuards(StoreAccessGuard)
  @Post(':id/ssl/refresh')
  refreshSsl(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.storesService.refreshSsl(id, user);
  }
}
