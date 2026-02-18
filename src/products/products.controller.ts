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
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { ProductsService } from './products.service';

class CreateProductDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsNumber()
  stock?: number;
}

class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

class CreateVariantDto {
  @IsString()
  optionName!: string;

  @IsString()
  optionValue!: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;
}

class UpdateVariantDto {
  @IsOptional()
  @IsString()
  optionName?: string;

  @IsOptional()
  @IsString()
  optionValue?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;
}

@Controller('api/stores/:id/products')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Param('id') storeId: string,
    @Body() dto: CreateProductDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productsService.create(storeId, dto, user);
  }

  @Get()
  list(@Param('id') storeId: string) {
    return this.productsService.list(storeId);
  }

  @Get(':productId')
  findOne(@Param('id') storeId: string, @Param('productId') productId: string) {
    return this.productsService.findOne(storeId, productId);
  }

  @Patch(':productId')
  update(
    @Param('id') storeId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productsService.update(storeId, productId, dto, user);
  }

  @Delete(':productId')
  remove(
    @Param('id') storeId: string,
    @Param('productId') productId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productsService.delete(storeId, productId, user);
  }

  @Post(':productId/variants')
  createVariant(
    @Param('id') storeId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productsService.createVariant(storeId, productId, dto, user);
  }

  @Get(':productId/variants')
  listVariants(
    @Param('id') storeId: string,
    @Param('productId') productId: string,
  ) {
    return this.productsService.listVariants(storeId, productId);
  }

  @Patch(':productId/variants/:variantId')
  updateVariant(
    @Param('id') storeId: string,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productsService.updateVariant(
      storeId,
      productId,
      variantId,
      dto,
      user,
    );
  }

  @Delete(':productId/variants/:variantId')
  deleteVariant(
    @Param('id') storeId: string,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productsService.deleteVariant(
      storeId,
      productId,
      variantId,
      user,
    );
  }
}
