import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(
    storeId: string,
    options?: {
      page?: number;
      limit?: number;
      q?: string;
      status?: string;
      from?: string;
      to?: string;
      sort?: string;
    },
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(Math.max(options?.limit ?? 20, 1), 200);
    const where: Prisma.ProductReviewWhereInput = {
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

  async approve(
    storeId: string,
    reviewId: string,
    isApproved: boolean,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.productReview.findFirst({
      where: { id: reviewId, storeId },
    });
    if (!existing) throw new NotFoundException('Review not found');

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

  async remove(
    storeId: string,
    reviewId: string,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.productReview.findFirst({
      where: { id: reviewId, storeId },
    });
    if (!existing) throw new NotFoundException('Review not found');

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

  private toApprovalFilter(status?: string): Prisma.ProductReviewWhereInput | null {
    if (!status) return null;
    const raw = status.trim().toLowerCase();
    if (['approved', 'published', 'active'].includes(raw)) {
      return { isApproved: true };
    }
    if (['pending', 'rejected', 'unapproved', 'hidden'].includes(raw)) {
      return { isApproved: false };
    }
    return null;
  }

  private reviewSort(sort?: string): Prisma.ProductReviewOrderByWithRelationInput {
    const key = String(sort ?? 'createdAt_desc').trim().toLowerCase();
    if (key === 'createdat_asc') return { createdAt: 'asc' };
    if (key === 'rating_desc') return { rating: 'desc' };
    if (key === 'rating_asc') return { rating: 'asc' };
    return { createdAt: 'desc' };
  }
}
