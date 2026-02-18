import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { ThemesService } from './themes.service';

class ApplyThemeDto {
  @IsString()
  preset!: string;

  @IsOptional()
  @IsObject()
  customJson?: Record<string, unknown>;
}

@Controller()
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get('api/themes')
  presets() {
    return this.themesService.presets();
  }

  @UseGuards(JwtAuthGuard, StoreAccessGuard)
  @Get('api/stores/:id/themes')
  storeTheme(@Param('id') storeId: string) {
    return this.themesService.storeTheme(storeId);
  }

  @UseGuards(JwtAuthGuard, StoreAccessGuard)
  @Patch('api/stores/:id/themes/apply')
  apply(
    @Param('id') storeId: string,
    @Body() dto: ApplyThemeDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.themesService.apply(storeId, dto, user);
  }
}
