import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { CategoriesService } from './categories.service';

class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;
}

class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;
}

@Controller('api/stores/:id/categories')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @Param('id') storeId: string,
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.categoriesService.create(storeId, dto, user);
  }

  @Get()
  list(@Param('id') storeId: string) {
    return this.categoriesService.list(storeId);
  }

  @Patch(':categoryId')
  update(
    @Param('id') storeId: string,
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.categoriesService.update(storeId, categoryId, dto, user);
  }

  @Delete(':categoryId')
  remove(
    @Param('id') storeId: string,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.categoriesService.remove(storeId, categoryId, user);
  }
}
