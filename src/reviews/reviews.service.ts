import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  list(storeId: string) {
    return this.prisma.productReview.findMany({
      where: { storeId },
      include: {
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
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
}
