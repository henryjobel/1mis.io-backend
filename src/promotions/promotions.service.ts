import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromotionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  listCoupons(storeId: string) {
    return this.prisma.coupon.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCoupon(
    storeId: string,
    data: {
      code: string;
      type: 'flat' | 'percent';
      value: number;
      minOrderAmount?: number;
      maxDiscount?: number;
      isActive?: boolean;
    },
    actor: { id: string; role: Role },
  ) {
    const coupon = await this.prisma.coupon.create({
      data: { storeId, ...data, code: data.code.toUpperCase() },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'coupon.create',
      entityType: 'Coupon',
      entityId: coupon.id,
    });
    return coupon;
  }

  async updateCoupon(
    storeId: string,
    couponId: string,
    data: Record<string, unknown>,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.coupon.findFirst({
      where: { id: couponId, storeId },
    });
    if (!existing) throw new NotFoundException('Coupon not found');
    const nextData = { ...data } as Record<string, unknown>;
    if (typeof nextData.code === 'string')
      nextData.code = nextData.code.toUpperCase();
    const updated = await this.prisma.coupon.update({
      where: { id: couponId },
      data: nextData,
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'coupon.update',
      entityType: 'Coupon',
      entityId: couponId,
    });
    return updated;
  }

  async deleteCoupon(
    storeId: string,
    couponId: string,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.coupon.findFirst({
      where: { id: couponId, storeId },
    });
    if (!existing) throw new NotFoundException('Coupon not found');
    const deleted = await this.prisma.coupon.delete({
      where: { id: couponId },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'coupon.delete',
      entityType: 'Coupon',
      entityId: couponId,
    });
    return deleted;
  }

  listTaxRules(storeId: string) {
    return this.prisma.taxRule.findMany({
      where: { storeId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createTaxRule(
    storeId: string,
    data: {
      name: string;
      country?: string;
      region?: string;
      rate: number;
      isDefault?: boolean;
      isActive?: boolean;
    },
    actor: { id: string; role: Role },
  ) {
    if (data.isDefault) {
      await this.prisma.taxRule.updateMany({
        where: { storeId },
        data: { isDefault: false },
      });
    }
    const taxRule = await this.prisma.taxRule.create({
      data: { storeId, ...data },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'tax_rule.create',
      entityType: 'TaxRule',
      entityId: taxRule.id,
    });
    return taxRule;
  }

  async updateTaxRule(
    storeId: string,
    taxRuleId: string,
    data: Record<string, unknown>,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.taxRule.findFirst({
      where: { id: taxRuleId, storeId },
    });
    if (!existing) throw new NotFoundException('Tax rule not found');
    if (data.isDefault === true) {
      await this.prisma.taxRule.updateMany({
        where: { storeId },
        data: { isDefault: false },
      });
    }
    const updated = await this.prisma.taxRule.update({
      where: { id: taxRuleId },
      data,
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'tax_rule.update',
      entityType: 'TaxRule',
      entityId: taxRuleId,
    });
    return updated;
  }

  async deleteTaxRule(
    storeId: string,
    taxRuleId: string,
    actor: { id: string; role: Role },
  ) {
    const existing = await this.prisma.taxRule.findFirst({
      where: { id: taxRuleId, storeId },
    });
    if (!existing) throw new NotFoundException('Tax rule not found');
    const deleted = await this.prisma.taxRule.delete({
      where: { id: taxRuleId },
    });
    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'tax_rule.delete',
      entityType: 'TaxRule',
      entityId: taxRuleId,
    });
    return deleted;
  }
}
