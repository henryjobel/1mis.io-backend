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
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { PRODUCT_AI_FIELDS, ProductsService } from './products.service';

class CreateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoMetaDescription?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  suggestedPrice?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  discountedPrice?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  price?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsBoolean()
  reviewsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  stockTrackingEnabled?: boolean;

  @IsOptional()
  @IsDateString()
  discountEndsAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actionItems?: string[];
}

class UpdateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoMetaDescription?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  suggestedPrice?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  discountedPrice?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  price?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  reviewsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  stockTrackingEnabled?: boolean;

  @IsOptional()
  @IsDateString()
  discountEndsAt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actionItems?: string[];
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

class DuplicateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

class GenerateProductAiDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

class RegenerateProductAiFieldDto {
  @IsString()
  @IsIn(PRODUCT_AI_FIELDS)
  field!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  apply?: boolean;
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

  @Post('ai/generate')
  generateFromAi(
    @Param('id') storeId: string,
    @Body() dto: GenerateProductAiDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productsService.generateAiFields(storeId, dto, user);
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

  @Post(':productId/duplicate')
  duplicate(
    @Param('id') storeId: string,
    @Param('productId') productId: string,
    @Body() dto: DuplicateProductDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productsService.duplicate(storeId, productId, dto, user);
  }

  @Post(':productId/ai/regenerate-field')
  regenerateAiField(
    @Param('id') storeId: string,
    @Param('productId') productId: string,
    @Body() dto: RegenerateProductAiFieldDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.productsService.regenerateAiField(
      storeId,
      productId,
      {
        field: dto.field,
        imageUrls: dto.imageUrls,
        prompt: dto.prompt,
        region: dto.region,
        currency: dto.currency,
        apply: dto.apply ?? false,
      },
      user,
    );
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
