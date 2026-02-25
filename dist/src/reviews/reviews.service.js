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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("../common/audit.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async list(storeId, options) {
        const page = Math.max(1, options?.page ?? 1);
        const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
        const where = {
            storeId,
            ...(this.toApprovalFilter(options?.status) ?? {}),
            ...(options?.q
                ? {
                    OR: [
                        { customer: { contains: options.q, mode: 'insensitive' } },
                        { title: { contains: options.q, mode: 'insensitive' } },
                        { comment: { contains: options.q, mode: 'insensitive' } },
                        {
                            product: {
                                title: { contains: options.q, mode: 'insensitive' },
                            },
                        },
                    ],
                }
                : {}),
            ...(options?.from || options?.to
                ? {
                    createdAt: {
                        ...(options?.from ? { gte: new Date(options.from) } : {}),
                        ...(options?.to ? { lte: new Date(options.to) } : {}),
                    },
                }
                : {}),
        };
        const skip = (page - 1) * limit;
        const orderBy = this.reviewSort(options?.sort);
        const [items, total] = await Promise.all([
            this.prisma.productReview.findMany({
                where,
                include: {
                    product: { select: { id: true, title: true } },
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.productReview.count({ where }),
        ]);
        return {
            items,
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async approve(storeId, reviewId, isApproved, actor) {
        const existing = await this.prisma.productReview.findFirst({
            where: { id: reviewId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Review not found');
        const updated = await this.prisma.productReview.update({
            where: { id: reviewId },
            data: { isApproved },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'review.approval.update',
            entityType: 'ProductReview',
            entityId: reviewId,
            metaJson: { isApproved },
        });
        return updated;
    }
    async remove(storeId, reviewId, actor) {
        const existing = await this.prisma.productReview.findFirst({
            where: { id: reviewId, storeId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Review not found');
        const deleted = await this.prisma.productReview.delete({
            where: { id: reviewId },
        });
        await this.auditService.log({
            actorUserId: actor.id,
            role: actor.role,
            action: 'review.delete',
            entityType: 'ProductReview',
            entityId: reviewId,
            metaJson: { storeId },
        });
        return deleted;
    }
    toApprovalFilter(status) {
        if (!status)
            return null;
        const raw = status.trim().toLowerCase();
        if (['approved', 'published', 'active'].includes(raw)) {
            return { isApproved: true };
        }
        if (['pending', 'rejected', 'unapproved', 'hidden'].includes(raw)) {
            return { isApproved: false };
        }
        return null;
    }
    reviewSort(sort) {
        const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
        if (key === 'createdat_asc')
            return { createdAt: 'asc' };
        if (key === 'rating_desc')
            return { rating: 'desc' };
        if (key === 'rating_asc')
            return { rating: 'asc' };
        return { createdAt: 'desc' };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map