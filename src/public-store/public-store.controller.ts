import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  IsEmail,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PublicStoreService } from './public-store.service';

class AddCartItemDto {
  @IsString()
  sessionId!: string;

  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty!: number;
}

class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty!: number;
}

class CheckoutDto {
  @IsString()
  sessionId!: string;

  @IsString()
  customerName!: string;

  @IsEmail()
  customerEmail!: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsObject()
  shippingAddress?: Record<string, unknown>;
}

class CreateReviewDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}

@Controller('api/public/stores/:slug')
export class PublicStoreController {
  constructor(private readonly publicStoreService: PublicStoreService) {}

  @Get('meta')
  meta(@Param('slug') slug: string) {
    return this.publicStoreService.meta(slug);
  }

  @Get('products')
  products(
    @Param('slug') slug: string,
    @Query('category') category?: string,
    @Query('q') q?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.publicStoreService.products(slug, {
      category,
      q,
      sort,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  @Get('products/:productId')
  product(@Param('slug') slug: string, @Param('productId') productId: string) {
    return this.publicStoreService.product(slug, productId);
  }

  @Get('categories')
  categories(@Param('slug') slug: string) {
    return this.publicStoreService.categories(slug);
  }

  @Get('trending')
  trending(@Param('slug') slug: string) {
    return this.publicStoreService.trending(slug);
  }

  @Get('best-selling')
  bestSelling(@Param('slug') slug: string) {
    return this.publicStoreService.bestSelling(slug);
  }

  @Get('reviews')
  reviews(@Param('slug') slug: string, @Query('productId') productId?: string) {
    return this.publicStoreService.reviews(slug, productId);
  }

  @Post('reviews')
  createReview(@Param('slug') slug: string, @Body() dto: CreateReviewDto) {
    return this.publicStoreService.createReview(slug, dto);
  }

  @Get('cart')
  cart(@Param('slug') slug: string, @Query('sessionId') sessionId: string) {
    return this.publicStoreService.getCart(slug, sessionId);
  }

  @Post('cart/items')
  addCartItem(@Param('slug') slug: string, @Body() dto: AddCartItemDto) {
    return this.publicStoreService.addCartItem(slug, dto);
  }

  @Patch('cart/items/:itemId')
  updateCartItem(
    @Param('slug') slug: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @Query('sessionId') sessionId: string,
  ) {
    return this.publicStoreService.updateCartItem(
      slug,
      sessionId,
      itemId,
      dto.qty,
    );
  }

  @Delete('cart/items/:itemId')
  deleteCartItem(
    @Param('slug') slug: string,
    @Param('itemId') itemId: string,
    @Query('sessionId') sessionId: string,
  ) {
    return this.publicStoreService.deleteCartItem(slug, sessionId, itemId);
  }

  @Post('checkout')
  checkout(@Param('slug') slug: string, @Body() dto: CheckoutDto) {
    return this.publicStoreService.checkout(slug, dto);
  }
}
