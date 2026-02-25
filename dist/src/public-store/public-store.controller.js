"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicStoreController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const public_store_service_1 = require("./public-store.service");
class AddCartItemDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCartItemDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCartItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCartItemDto.prototype, "variantId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AddCartItemDto.prototype, "qty", void 0);
class UpdateCartItemDto {
}
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateCartItemDto.prototype, "qty", void 0);
class CheckoutDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckoutDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckoutDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CheckoutDto.prototype, "customerEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckoutDto.prototype, "customerPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckoutDto.prototype, "couponCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CheckoutDto.prototype, "shippingAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['cod', 'stripe', 'sslcommerz']),
    __metadata("design:type", String)
], CheckoutDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CheckoutDto.prototype, "paymentMeta", void 0);
class CreateReviewDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "productId", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], CreateReviewDto.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "customer", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReviewDto.prototype, "comment", void 0);
let PublicStoreController = class PublicStoreController {
    constructor(publicStoreService) {
        this.publicStoreService = publicStoreService;
    }
    meta(slug) {
        return this.publicStoreService.meta(slug);
    }
    products(slug, category, q, sort, page, limit, minPrice, maxPrice) {
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
    product(slug, productId) {
        return this.publicStoreService.product(slug, productId);
    }
    categories(slug) {
        return this.publicStoreService.categories(slug);
    }
    trending(slug) {
        return this.publicStoreService.trending(slug);
    }
    bestSelling(slug) {
        return this.publicStoreService.bestSelling(slug);
    }
    reviews(slug, productId) {
        return this.publicStoreService.reviews(slug, productId);
    }
    createReview(slug, dto) {
        return this.publicStoreService.createReview(slug, dto);
    }
    cart(slug, sessionId) {
        return this.publicStoreService.getCart(slug, sessionId);
    }
    addCartItem(slug, dto) {
        return this.publicStoreService.addCartItem(slug, dto);
    }
    updateCartItem(slug, itemId, dto, sessionId) {
        return this.publicStoreService.updateCartItem(slug, sessionId, itemId, dto.qty);
    }
    deleteCartItem(slug, itemId, sessionId) {
        return this.publicStoreService.deleteCartItem(slug, sessionId, itemId);
    }
    checkout(slug, dto) {
        return this.publicStoreService.checkout(slug, dto);
    }
    order(slug, orderCode, email) {
        return this.publicStoreService.order(slug, orderCode, email);
    }
    policies(slug) {
        return this.publicStoreService.policies(slug);
    }
};
exports.PublicStoreController = PublicStoreController;
__decorate([
    (0, common_1.Get)('meta'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "meta", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('q')),
    __param(3, (0, common_1.Query)('sort')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('minPrice')),
    __param(7, (0, common_1.Query)('maxPrice')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "products", null);
__decorate([
    (0, common_1.Get)('products/:productId'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "product", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('trending'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "trending", null);
__decorate([
    (0, common_1.Get)('best-selling'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "bestSelling", null);
__decorate([
    (0, common_1.Get)('reviews'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "reviews", null);
__decorate([
    (0, common_1.Post)('reviews'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateReviewDto]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)('cart'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "cart", null);
__decorate([
    (0, common_1.Post)('cart/items'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddCartItemDto]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "addCartItem", null);
__decorate([
    (0, common_1.Patch)('cart/items/:itemId'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpdateCartItemDto, String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "updateCartItem", null);
__decorate([
    (0, common_1.Delete)('cart/items/:itemId'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "deleteCartItem", null);
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CheckoutDto]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "checkout", null);
__decorate([
    (0, common_1.Get)('orders/:orderCode'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Param)('orderCode')),
    __param(2, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "order", null);
__decorate([
    (0, common_1.Get)('policies'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicStoreController.prototype, "policies", null);
exports.PublicStoreController = PublicStoreController = __decorate([
    (0, common_1.Controller)('api/public/stores/:slug'),
    __metadata("design:paramtypes", [public_store_service_1.PublicStoreService])
], PublicStoreController);
//# sourceMappingURL=public-store.controller.js.map