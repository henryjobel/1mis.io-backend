import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Plan,
  Prisma,
  Role,
  SubscriptionInvoiceStatus,
  SubscriptionStatus,
  UsageTracking,
} from '@prisma/client';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_BACKEND_PUBLIC_URL = 'http://localhost:4000';
const DEFAULT_OWNER_APP_URL = 'http://localhost:8080';
const DEFAULT_OWNER_DASHBOARD_BILLING_PATH = '/dashboard/billing';
const DEFAULT_SSLCOMMERZ_API_BASE_URL = 'https://sandbox.sslcommerz.com';
const DEFAULT_SSLCOMMERZ_INIT_PATH = '/gwprocess/v4/api.php';
const DEFAULT_SSLCOMMERZ_VALIDATION_API_PATH =
  '/validator/api/validationserverAPI.php';

type WebhookPaymentStatus = 'paid' | 'failed' | 'cancelled' | 'pending';

type SubscriptionWithPlan = Prisma.SubscriptionGetPayload<{
  include: { plan: true };
}>;

type SubscriptionInvoiceWithPlan = Prisma.SubscriptionInvoiceGetPayload<{
  include: { plan: true };
}>;

type SslCommerzPaidValidationResult = {
  valid: boolean;
  mode: 'mock' | 'skipped' | 'api';
  reason: string;
  valId?: string;
  providerRef?: string;
  rawStatus?: string;
  amountBdt?: number;
  currency?: string;
};

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async listPlans() {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return plans.map((plan) => this.mapPlan(plan));
  }

  async storeSubscription(storeId: string) {
    const [subscription, usage, productsUsed] = await Promise.all([
      this.ensureStoreSubscription(storeId),
      this.ensureUsageTracking(storeId),
      this.prisma.product.count({ where: { storeId } }),
    ]);

    const normalizedUsage =
      usage.productsUsed === productsUsed
        ? usage
        : await this.prisma.usageTracking.update({
            where: { id: usage.id },
            data: { productsUsed },
          });

    return this.buildSubscriptionPayload(storeId, subscription, normalizedUsage);
  }

  async listSubscriptionInvoices(
    storeId: string,
    options?: { page?: number; limit?: number },
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;
    const where: Prisma.SubscriptionInvoiceWhereInput = { storeId };

    const [items, total] = await Promise.all([
      this.prisma.subscriptionInvoice.findMany({
        where,
        include: {
          plan: {
            select: {
              id: true,
              key: true,
              name: true,
              priceBdt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.subscriptionInvoice.count({ where }),
    ]);

    return {
      items: items.map((invoice) => ({
        id: invoice.id,
        subscriptionId: invoice.subscriptionId,
        plan: invoice.plan,
        amountBdt: invoice.amountBdt,
        status: invoice.status,
        provider: invoice.provider,
        providerRef: invoice.providerRef,
        dueDate: invoice.dueDate?.toISOString() ?? null,
        paidAt: invoice.paidAt?.toISOString() ?? null,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
      })),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async listSubscriptionPaymentEvents(
    storeId: string,
    options?: { page?: number; limit?: number },
  ) {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100);
    const skip = (page - 1) * limit;
    const where: Prisma.SubscriptionPaymentEventWhereInput = { storeId };

    const [items, total] = await Promise.all([
      this.prisma.subscriptionPaymentEvent.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              status: true,
              provider: true,
              providerRef: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.subscriptionPaymentEvent.count({ where }),
    ]);

    return {
      items: items.map((event) => ({
        id: event.id,
        invoiceId: event.invoiceId,
        provider: event.provider,
        eventType: event.eventType,
        status: event.status,
        providerRef: event.providerRef,
        createdAt: event.createdAt.toISOString(),
        invoice: event.invoice
          ? {
              id: event.invoice.id,
              status: event.invoice.status,
              provider: event.invoice.provider,
              providerRef: event.invoice.providerRef,
            }
          : null,
      })),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async assertProductCreateAllowed(
    storeId: string,
    createCount = 1,
    options?: { existingProductsCount?: number },
  ) {
    const subscription = await this.ensureStoreSubscription(storeId);
    const limit = subscription.plan.productLimit;
    const normalizedCreateCount = Number.isFinite(createCount)
      ? Math.max(0, Math.floor(createCount))
      : 0;
    const existingProductsCount =
      options?.existingProductsCount ??
      (await this.prisma.product.count({ where: { storeId } }));

    if (
      limit != null &&
      existingProductsCount + normalizedCreateCount > limit
    ) {
      throw new ForbiddenException(
        `Product limit reached for ${subscription.plan.name} plan (${limit} products). Upgrade to add more products.`,
      );
    }

    return {
      limit,
      existingProductsCount,
      nextProductsCount: existingProductsCount + normalizedCreateCount,
    };
  }

  async syncProductsUsage(storeId: string, productsUsed?: number) {
    const usage = await this.ensureUsageTracking(storeId);
    const nextProductsUsed =
      productsUsed ?? (await this.prisma.product.count({ where: { storeId } }));

    if (usage.productsUsed === nextProductsUsed) {
      return usage;
    }

    return this.prisma.usageTracking.update({
      where: { id: usage.id },
      data: { productsUsed: nextProductsUsed },
    });
  }

  async consumeAiUsage(storeId: string, units = 1) {
    const subscription = await this.ensureStoreSubscription(storeId);
    const usage = await this.ensureUsageTracking(storeId);
    const limit = subscription.plan.aiLimit;
    const normalizedUnits = Number.isFinite(units)
      ? Math.max(1, Math.floor(units))
      : 1;

    if (limit != null && usage.aiRequestsUsed + normalizedUnits > limit) {
      throw new ForbiddenException(
        `AI request limit reached for ${subscription.plan.name} plan (${limit} per cycle). Renew or upgrade to continue.`,
      );
    }

    return this.prisma.usageTracking.update({
      where: { id: usage.id },
      data: {
        aiRequestsUsed: { increment: normalizedUnits },
      },
    });
  }

  async assertStorageUploadAllowed(storeId: string, sizeBytes: number) {
    const subscription = await this.ensureStoreSubscription(storeId);
    const usage = await this.ensureUsageTracking(storeId);
    const limit = subscription.plan.storageLimitMb;
    const requestedStorageMb = this.bytesToMegabytes(sizeBytes);

    if (limit != null && usage.storageUsedMb + requestedStorageMb > limit) {
      throw new ForbiddenException(
        `Storage limit reached for ${subscription.plan.name} plan (${limit} MB). Remove files or upgrade your plan.`,
      );
    }

    return {
      limit,
      currentStorageUsedMb: usage.storageUsedMb,
      requestedStorageMb,
      nextStorageUsedMb: usage.storageUsedMb + requestedStorageMb,
    };
  }

  async consumeStorageUsage(storeId: string, sizeBytes: number) {
    const usage = await this.ensureUsageTracking(storeId);
    const incrementMb = this.bytesToMegabytes(sizeBytes);

    if (incrementMb <= 0) {
      return usage;
    }

    await this.assertStorageUploadAllowed(storeId, sizeBytes);

    return this.prisma.usageTracking.update({
      where: { id: usage.id },
      data: {
        storageUsedMb: { increment: incrementMb },
      },
    });
  }

  async releaseStorageUsage(storeId: string, sizeBytes: number) {
    const usage = await this.ensureUsageTracking(storeId);
    const decrementMb = this.bytesToMegabytes(sizeBytes);

    if (decrementMb <= 0 || usage.storageUsedMb <= 0) {
      return usage;
    }

    return this.prisma.usageTracking.update({
      where: { id: usage.id },
      data: {
        storageUsedMb: Math.max(0, usage.storageUsedMb - decrementMb),
      },
    });
  }

  async assertPublishAllowed(storeId: string) {
    const subscription = await this.ensureStoreSubscription(storeId);
    const now = new Date();

    if (
      subscription.status !== SubscriptionStatus.active ||
      subscription.endDate <= now
    ) {
      throw new ForbiddenException(
        'Active subscription required to publish the store. Please renew your plan.',
      );
    }

    return subscription;
  }

  async assertCustomDomainAllowed(storeId: string) {
    const subscription = await this.ensureStoreSubscription(storeId);
    const now = new Date();

    if (
      subscription.status !== SubscriptionStatus.active ||
      subscription.endDate <= now
    ) {
      throw new ForbiddenException(
        'Active subscription required to connect a custom domain.',
      );
    }

    if (!subscription.plan.customDomainAllowed) {
      throw new ForbiddenException(
        'Custom domain is not available on your current plan.',
      );
    }

    return subscription;
  }

  async renewSubscription(
    storeId: string,
    actor: { id: string; role: Role },
    options?: { planKey?: string; months?: number },
  ) {
    const store = await this.resolveStore(storeId);
    const currentSubscription = await this.ensureStoreSubscription(storeId);
    const plan = options?.planKey
      ? await this.getActivePlanByKey(options.planKey)
      : currentSubscription.plan;

    if (!plan) {
      throw new NotFoundException('Plan not found or inactive');
    }

    const months = options?.months ?? 1;
    const now = new Date();
    const extendDays = Math.max(1, plan.billingCycleDays * months);
    const baseDate =
      currentSubscription.status === SubscriptionStatus.active &&
      currentSubscription.endDate > now
        ? currentSubscription.endDate
        : now;
    const nextEndDate = this.addDays(baseDate, extendDays);
    const nextStartDate =
      currentSubscription.status === SubscriptionStatus.active &&
      currentSubscription.endDate > now
        ? currentSubscription.startDate
        : now;

    const [subscription, invoice] = await this.prisma.$transaction(async (tx) => {
      const nextSubscription = await tx.subscription.upsert({
        where: { storeId },
        create: {
          storeId,
          userId: store.ownerId,
          planId: plan.id,
          status: SubscriptionStatus.active,
          startDate: nextStartDate,
          endDate: nextEndDate,
        },
        update: {
          userId: store.ownerId,
          planId: plan.id,
          status: SubscriptionStatus.active,
          startDate: nextStartDate,
          endDate: nextEndDate,
          cancelledAt: null,
        },
        include: { plan: true },
      });

      const paidInvoice = await tx.subscriptionInvoice.create({
        data: {
          storeId,
          subscriptionId: nextSubscription.id,
          planId: plan.id,
          amountBdt: plan.priceBdt,
          status: SubscriptionInvoiceStatus.paid,
          provider: 'manual',
          paidAt: now,
          metadata: {
            source: 'manual_renew',
            months,
            requestedBy: actor.id,
          } as Prisma.InputJsonValue,
        },
      });

      return [nextSubscription, paidInvoice] as const;
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'subscription.renew',
      entityType: 'Subscription',
      entityId: subscription.id,
      metaJson: {
        storeId,
        planKey: plan.key,
        months,
        invoiceId: invoice.id,
      },
    });

    const usage = await this.ensureUsageTracking(storeId);
    return {
      ...this.buildSubscriptionPayload(storeId, subscription, usage),
      invoice: {
        id: invoice.id,
        status: invoice.status,
        amountBdt: invoice.amountBdt,
        provider: invoice.provider,
        paidAt: invoice.paidAt?.toISOString() ?? null,
      },
      renewed: true,
    };
  }

  async initSslCommerz(
    storeId: string,
    actor: { id: string; role: Role },
    options?: { planKey?: string },
  ) {
    const currentSubscription = await this.ensureStoreSubscription(storeId);
    const plan = options?.planKey
      ? await this.getActivePlanByKey(options.planKey)
      : currentSubscription.plan;

    if (!plan) {
      throw new NotFoundException('Plan not found or inactive');
    }
    if (plan.priceBdt <= 0) {
      throw new BadRequestException(
        'Selected plan has no payable amount. Use renew endpoint directly.',
      );
    }

    const dueDate = this.addDays(new Date(), 1);
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const invoice = await this.prisma.subscriptionInvoice.create({
      data: {
        storeId,
        subscriptionId: currentSubscription.id,
        planId: plan.id,
        amountBdt: plan.priceBdt,
        status: SubscriptionInvoiceStatus.pending,
        provider: 'sslcommerz',
        dueDate,
        metadata: {
          source: 'sslcommerz_init',
          requestedBy: actor.id,
          planKey: plan.key,
          amountBdt: plan.priceBdt,
        } as Prisma.InputJsonValue,
      },
    });

    const sslSession = await this.initSslCommerzSession({
      invoiceId: invoice.id,
      storeId,
      storeName: store.name,
      ownerName: store.owner.name,
      ownerEmail: store.owner.email,
      amountBdt: invoice.amountBdt,
      planName: plan.name,
    });

    const nextMetadata = {
      ...this.asRecord(invoice.metadata),
      sslcommerz: {
        mode: sslSession.mode,
        requestedAt: new Date().toISOString(),
        transactionId: sslSession.transactionId,
        gatewaySessionKey: sslSession.gatewaySessionKey,
        gatewayStatus: sslSession.gatewayStatus,
        paymentUrl: sslSession.paymentUrl,
      },
    };

    await this.prisma.subscriptionInvoice.update({
      where: { id: invoice.id },
      data: {
        metadata: nextMetadata as Prisma.InputJsonValue,
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'subscription.sslcommerz.init',
      entityType: 'SubscriptionInvoice',
      entityId: invoice.id,
      metaJson: {
        storeId,
        planKey: plan.key,
      },
    });

    return {
      invoiceId: invoice.id,
      storeId,
      planKey: plan.key,
      amountBdt: invoice.amountBdt,
      currency: 'BDT',
      status: invoice.status,
      provider: 'sslcommerz',
      mode: sslSession.mode,
      transactionId: sslSession.transactionId,
      paymentUrl: sslSession.paymentUrl,
      expiresAt: dueDate.toISOString(),
    };
  }

  async cancelSubscription(
    storeId: string,
    actor: { id: string; role: Role },
    reason?: string,
  ) {
    const existing = await this.prisma.subscription.findUnique({
      where: { storeId },
      include: { plan: true },
    });
    if (!existing) {
      throw new NotFoundException('Subscription not found');
    }

    const cancelled = await this.prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: SubscriptionStatus.cancelled,
        cancelledAt: new Date(),
      },
      include: { plan: true },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      role: actor.role,
      action: 'subscription.cancel',
      entityType: 'Subscription',
      entityId: cancelled.id,
      metaJson: {
        storeId,
        reason: reason ?? null,
      },
    });

    const usage = await this.ensureUsageTracking(storeId);
    return {
      ...this.buildSubscriptionPayload(storeId, cancelled, usage),
      cancelled: true,
      cancelledAt: cancelled.cancelledAt?.toISOString() ?? null,
      reason: reason ?? null,
    };
  }

  async handleSslCommerzProviderCallback(
    payload: Record<string, unknown>,
    secret?: string,
    options?: { forcedStatus?: WebhookPaymentStatus; source?: string },
  ) {
    const invoiceId =
      this.pickString(payload.invoiceId) ??
      this.pickString(payload.invoice_id) ??
      this.pickString(payload.value_a);
    const transactionId =
      this.pickString(payload.transactionId) ??
      this.pickString(payload.transaction_id) ??
      this.pickString(payload.bank_tran_id) ??
      this.pickString(payload.val_id) ??
      this.pickString(payload.tran_id);
    const eventType =
      this.pickString(payload.eventType) ??
      this.pickString(payload.event_type) ??
      this.pickString(payload.status) ??
      options?.source;
    const incomingStatus =
      options?.forcedStatus ??
      this.normalizePaymentStatus(
        this.pickString(payload.status) ??
          this.pickString(payload.eventType) ??
          this.pickString(payload.event_type),
      );

    return this.handleSslCommerzSubscriptionWebhook(
      {
        invoiceId,
        transactionId,
        eventType,
        status: incomingStatus,
        storeId:
          this.pickString(payload.storeId) ??
          this.pickString(payload.store_id) ??
          this.pickString(payload.value_b),
        amountBdt:
          this.pickNumber(payload.amountBdt) ??
          this.pickNumber(payload.amount),
        payload,
      },
      secret,
    );
  }

  async mockSslCommerzSubscriptionResult(
    invoiceId: string,
    status: WebhookPaymentStatus = 'paid',
  ) {
    const transactionId = `mock-tx-${Date.now().toString(36)}`;
    return this.handleSslCommerzSubscriptionWebhook(
      {
        invoiceId,
        transactionId,
        eventType: `mock_${status}`,
        status,
        payload: {
          source: 'mock_checkout',
          invoiceId,
          transactionId,
          status,
        },
      },
      undefined,
    );
  }

  buildOwnerBillingRedirectUrl(
    status: 'success' | 'failed' | 'cancelled',
    payload: Record<string, unknown>,
    callbackResult?: Record<string, unknown>,
  ) {
    const baseUrl = this.resolveOwnerBillingRedirectBaseUrl();
    let redirectUrl: URL;

    try {
      redirectUrl = new URL(baseUrl);
    } catch {
      redirectUrl = new URL(
        `${this.trimTrailingSlash(DEFAULT_OWNER_APP_URL)}${DEFAULT_OWNER_DASHBOARD_BILLING_PATH}`,
      );
    }

    const callback = callbackResult ?? {};
    const invoiceId =
      this.pickString(payload.invoiceId) ??
      this.pickString(payload.invoice_id) ??
      this.pickString(payload.value_a) ??
      this.pickString(callback.invoiceId);
    const transactionId =
      this.pickString(payload.transactionId) ??
      this.pickString(payload.transaction_id) ??
      this.pickString(payload.bank_tran_id) ??
      this.pickString(payload.val_id) ??
      this.pickString(payload.tran_id) ??
      this.pickString(callback.transactionId);
    const reason = this.pickString(callback.reason);
    const processed = this.pickBoolean(callback.processed);

    redirectUrl.searchParams.set('payment', status);
    if (invoiceId) {
      redirectUrl.searchParams.set('invoiceId', invoiceId);
    }
    if (transactionId) {
      redirectUrl.searchParams.set('transactionId', transactionId);
    }
    if (processed != null) {
      redirectUrl.searchParams.set('processed', processed ? '1' : '0');
    }
    if (reason) {
      redirectUrl.searchParams.set('reason', reason);
    }

    return redirectUrl.toString();
  }

  async handleSslCommerzSubscriptionWebhook(
    data: {
      invoiceId?: string;
      transactionId?: string;
      eventType?: string;
      status?: string;
      storeId?: string;
      amountBdt?: number;
      payload?: Record<string, unknown>;
    },
    secret?: string,
  ) {
    const invoice = await this.findInvoiceForWebhook(data);
    const paymentStatus = this.normalizePaymentStatus(data.status ?? data.eventType);
    const configuredSecret = this.configService.get<string>(
      'SSLCOMMERZ_WEBHOOK_SECRET',
    );
    const secretValid = !configuredSecret || configuredSecret === secret;

    if (!invoice) {
      await this.createOrphanWebhookEvent(data, paymentStatus, secretValid);
      return {
        accepted: false,
        processed: false,
        reason: 'invoice_not_found',
      };
    }

    const paidValidation =
      paymentStatus === 'paid'
        ? await this.validateSslCommerzPaidEvent(invoice, data)
        : null;
    const eventStatus = !secretValid
      ? 'rejected'
      : paidValidation && !paidValidation.valid
        ? 'rejected_validation'
        : paymentStatus;

    await this.prisma.subscriptionPaymentEvent.create({
      data: {
        storeId: invoice.storeId,
        invoiceId: invoice.id,
        provider: 'sslcommerz',
        eventType: data.eventType,
        status: eventStatus,
        providerRef:
          paidValidation?.providerRef ??
          data.transactionId ??
          invoice.providerRef,
        payload: {
          ...(data.payload ?? {}),
          validation: paidValidation ?? null,
        } as Prisma.InputJsonValue,
      },
    });

    if (!secretValid) {
      return {
        accepted: false,
        processed: false,
        invoiceId: invoice.id,
        reason: 'invalid_secret',
      };
    }

    if (paidValidation && !paidValidation.valid) {
      return {
        accepted: false,
        processed: false,
        invoiceId: invoice.id,
        reason: paidValidation.reason,
        validationMode: paidValidation.mode,
      };
    }

    if (paymentStatus === 'paid') {
      if (invoice.status === SubscriptionInvoiceStatus.paid) {
        return {
          accepted: true,
          processed: false,
          alreadyPaid: true,
          invoiceId: invoice.id,
          subscriptionId: invoice.subscriptionId,
        };
      }

      const now = new Date();
      const nowIso = now.toISOString();
      const nextMetadata = {
        ...this.asRecord(invoice.metadata),
        webhook: {
          receivedAt: nowIso,
          status: paymentStatus,
          eventType: data.eventType ?? null,
          transactionId:
            paidValidation?.providerRef ?? data.transactionId ?? null,
          validation: paidValidation
            ? {
                mode: paidValidation.mode,
                reason: paidValidation.reason,
                status: paidValidation.rawStatus ?? null,
                amountBdt: paidValidation.amountBdt ?? null,
                currency: paidValidation.currency ?? null,
              }
            : null,
        },
      };

      const result = await this.prisma.$transaction(async (tx) => {
        const updatedInvoice = await tx.subscriptionInvoice.update({
          where: { id: invoice.id },
          data: {
            status: SubscriptionInvoiceStatus.paid,
            providerRef:
              paidValidation?.providerRef ??
              data.transactionId ??
              invoice.providerRef,
            paidAt: now,
            metadata: nextMetadata as Prisma.InputJsonValue,
          },
          include: { plan: true },
        });

        const store = await tx.store.findUnique({
          where: { id: updatedInvoice.storeId },
          select: { ownerId: true },
        });
        if (!store) throw new NotFoundException('Store not found');

        const existing = await tx.subscription.findUnique({
          where: { storeId: updatedInvoice.storeId },
        });

        const baseDate =
          existing &&
          existing.status === SubscriptionStatus.active &&
          existing.endDate > now
            ? existing.endDate
            : now;
        const nextEndDate = this.addDays(
          baseDate,
          updatedInvoice.plan.billingCycleDays,
        );
        const nextStartDate =
          existing &&
          existing.status === SubscriptionStatus.active &&
          existing.endDate > now
            ? existing.startDate
            : now;

        const subscription = existing
          ? await tx.subscription.update({
              where: { id: existing.id },
              data: {
                userId: store.ownerId,
                planId: updatedInvoice.planId,
                status: SubscriptionStatus.active,
                startDate: nextStartDate,
                endDate: nextEndDate,
                cancelledAt: null,
              },
            })
          : await tx.subscription.create({
              data: {
                storeId: updatedInvoice.storeId,
                userId: store.ownerId,
                planId: updatedInvoice.planId,
                status: SubscriptionStatus.active,
                startDate: now,
                endDate: nextEndDate,
              },
            });

        return {
          invoice: updatedInvoice,
          subscription,
        };
      });

      await this.auditService.log({
        role: Role.support,
        action: 'subscription.webhook.sslcommerz.paid',
        entityType: 'SubscriptionInvoice',
        entityId: result.invoice.id,
        metaJson: {
          subscriptionId: result.subscription.id,
          storeId: result.invoice.storeId,
        },
      });

      return {
        accepted: true,
        processed: true,
        invoiceId: result.invoice.id,
        subscriptionId: result.subscription.id,
        newEndDate: result.subscription.endDate.toISOString(),
      };
    }

    const invoiceStatus = this.toInvoiceStatus(paymentStatus);
    if (
      invoiceStatus &&
      invoice.status !== SubscriptionInvoiceStatus.paid &&
      invoice.status !== invoiceStatus
    ) {
      await this.prisma.subscriptionInvoice.update({
        where: { id: invoice.id },
        data: {
          status: invoiceStatus,
          providerRef: data.transactionId ?? invoice.providerRef,
          metadata: {
            ...this.asRecord(invoice.metadata),
            webhook: {
              receivedAt: new Date().toISOString(),
              status: paymentStatus,
              eventType: data.eventType ?? null,
            },
          } as Prisma.InputJsonValue,
        },
      });
    }

    return {
      accepted: true,
      processed: Boolean(invoiceStatus),
      invoiceId: invoice.id,
      status: paymentStatus,
    };
  }

  private async ensureStoreSubscription(storeId: string) {
    const store = await this.resolveStore(storeId);

    let subscription = await this.prisma.subscription.findUnique({
      where: { storeId },
      include: { plan: true },
    });

    if (!subscription) {
      const freePlan = await this.ensureFreePlan();
      const now = new Date();
      subscription = await this.prisma.subscription.create({
        data: {
          storeId,
          userId: store.ownerId,
          planId: freePlan.id,
          status: SubscriptionStatus.active,
          startDate: now,
          endDate: this.addDays(now, freePlan.billingCycleDays),
        },
        include: { plan: true },
      });
    }

    if (
      subscription.status === SubscriptionStatus.active &&
      subscription.endDate <= new Date()
    ) {
      subscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.expired },
        include: { plan: true },
      });
    }

    return subscription;
  }

  private async ensureUsageTracking(storeId: string) {
    const now = new Date();
    const period = this.currentUsagePeriod(now);
    const existing = await this.prisma.usageTracking.findUnique({
      where: { storeId },
    });

    if (!existing) {
      return this.prisma.usageTracking.create({
        data: {
          storeId,
          periodStart: period.start,
          periodEnd: period.end,
        },
      });
    }

    if (existing.periodEnd <= now || existing.periodStart > now) {
      return this.prisma.usageTracking.update({
        where: { id: existing.id },
        data: {
          aiRequestsUsed: 0,
          productsUsed: 0,
          storageUsedMb: 0,
          periodStart: period.start,
          periodEnd: period.end,
        },
      });
    }

    return existing;
  }

  private buildSubscriptionPayload(
    storeId: string,
    subscription: SubscriptionWithPlan,
    usage: UsageTracking,
  ) {
    const now = new Date();
    const isExpired =
      subscription.status === SubscriptionStatus.expired ||
      subscription.endDate <= now;
    const daysRemaining = isExpired
      ? 0
      : Math.max(
          0,
          Math.ceil(
            (subscription.endDate.getTime() - now.getTime()) / DAY_MS,
          ),
        );

    return {
      storeId,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startDate: subscription.startDate.toISOString(),
        endDate: subscription.endDate.toISOString(),
        cancelledAt: subscription.cancelledAt?.toISOString() ?? null,
        isExpired,
        daysRemaining,
      },
      plan: this.mapPlan(subscription.plan),
      usage: {
        aiRequestsUsed: usage.aiRequestsUsed,
        productsUsed: usage.productsUsed,
        storageUsedMb: usage.storageUsedMb,
        periodStart: usage.periodStart.toISOString(),
        periodEnd: usage.periodEnd.toISOString(),
      },
      limits: {
        productLimit: subscription.plan.productLimit,
        aiLimit: subscription.plan.aiLimit,
        storageLimitMb: subscription.plan.storageLimitMb,
        customDomainAllowed: subscription.plan.customDomainAllowed,
      },
      features: {
        advancedAiEnabled: subscription.plan.advancedAiEnabled,
        analyticsEnabled: subscription.plan.analyticsEnabled,
        prioritySupport: subscription.plan.prioritySupport,
      },
    };
  }

  private mapPlan(plan: Plan) {
    return {
      id: plan.id,
      key: plan.key,
      name: plan.name,
      priceBdt: plan.priceBdt,
      billingCycleDays: plan.billingCycleDays,
      productLimit: plan.productLimit,
      aiLimit: plan.aiLimit,
      storageLimitMb: plan.storageLimitMb,
      customDomainAllowed: plan.customDomainAllowed,
      advancedAiEnabled: plan.advancedAiEnabled,
      analyticsEnabled: plan.analyticsEnabled,
      prioritySupport: plan.prioritySupport,
      isActive: plan.isActive,
    };
  }

  private async resolveStore(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, ownerId: true },
    });
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  private async ensureFreePlan() {
    const existing = await this.prisma.plan.findUnique({
      where: { key: 'free' },
    });
    if (existing) return existing;

    return this.prisma.plan.create({
      data: {
        key: 'free',
        name: 'Free',
        priceBdt: 0,
        billingCycleDays: 30,
        productLimit: 5,
        aiLimit: 20,
        storageLimitMb: 512,
        customDomainAllowed: false,
        advancedAiEnabled: false,
        analyticsEnabled: false,
        prioritySupport: false,
        isActive: true,
        sortOrder: 1,
      },
    });
  }

  private async getActivePlanByKey(planKey: string) {
    return this.prisma.plan.findFirst({
      where: {
        key: planKey.trim().toLowerCase(),
        isActive: true,
      },
    });
  }

  private currentUsagePeriod(now: Date) {
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
    );
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0),
    );
    return { start, end };
  }

  private addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * DAY_MS);
  }

  private bytesToMegabytes(sizeBytes: number) {
    const normalizedBytes = Number.isFinite(sizeBytes)
      ? Math.max(0, Math.floor(sizeBytes))
      : 0;
    if (normalizedBytes <= 0) return 0;
    return Math.max(1, Math.ceil(normalizedBytes / (1024 * 1024)));
  }

  private async initSslCommerzSession(input: {
    invoiceId: string;
    storeId: string;
    storeName: string;
    ownerName: string;
    ownerEmail: string;
    amountBdt: number;
    planName: string;
  }) {
    const storeId = this.configService.get<string>('SSLCOMMERZ_STORE_ID')?.trim();
    const storePassword = this.configService
      .get<string>('SSLCOMMERZ_STORE_PASSWORD')
      ?.trim();
    const backendPublicUrl = this.trimTrailingSlash(
      this.configService.get<string>('BACKEND_PUBLIC_URL') ??
        DEFAULT_BACKEND_PUBLIC_URL,
    );
    const sslBaseUrl = this.trimTrailingSlash(
      this.configService.get<string>('SSLCOMMERZ_API_BASE_URL') ??
        DEFAULT_SSLCOMMERZ_API_BASE_URL,
    );
    const sslInitPath =
      this.configService.get<string>('SSLCOMMERZ_INIT_PATH') ??
      DEFAULT_SSLCOMMERZ_INIT_PATH;

    // Dev fallback: mock checkout endpoint marks invoice paid for local testing.
    if (!storeId || !storePassword) {
      return {
        mode: 'mock' as const,
        transactionId: input.invoiceId,
        gatewaySessionKey: null,
        gatewayStatus: 'mock',
        paymentUrl: `${backendPublicUrl}/api/webhooks/sslcommerz/subscription/mock/${input.invoiceId}?status=paid`,
      };
    }

    const transactionId = input.invoiceId;
    const callbackUrls = this.buildSslCommerzCallbackUrls(backendPublicUrl);
    const payload = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: String(input.amountBdt),
      currency: 'BDT',
      tran_id: transactionId,
      success_url: callbackUrls.successUrl,
      fail_url: callbackUrls.failUrl,
      cancel_url: callbackUrls.cancelUrl,
      ipn_url: callbackUrls.ipnUrl,
      shipping_method: 'NO',
      product_name: `${input.planName} Plan`,
      product_category: 'SaaS Subscription',
      product_profile: 'general',
      cus_name: input.ownerName || 'Store Owner',
      cus_email: input.ownerEmail || 'owner@example.com',
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',
      value_a: input.invoiceId,
      value_b: input.storeId,
      value_c: input.planName,
      value_d: input.storeName,
    });

    const endpoint = `${sslBaseUrl}${sslInitPath.startsWith('/') ? sslInitPath : `/${sslInitPath}`}`;
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      });
    } catch {
      throw new BadRequestException(
        'Unable to reach SSLCommerz gateway. Check network access and API base URL.',
      );
    }

    const data = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const gatewayUrl = this.pickString(data.GatewayPageURL);
    const gatewayStatus = this.pickString(data.status) ?? 'unknown';
    const gatewaySessionKey =
      this.pickString(data.sessionkey) ?? this.pickString(data.sessionKey);

    if (!response.ok || !gatewayUrl) {
      throw new BadRequestException(
        `SSLCommerz init failed (${gatewayStatus}). Verify credentials and callback URLs.`,
      );
    }

    return {
      mode: 'live' as const,
      transactionId,
      gatewaySessionKey: gatewaySessionKey ?? null,
      gatewayStatus,
      paymentUrl: gatewayUrl,
    };
  }

  private async validateSslCommerzPaidEvent(
    invoice: SubscriptionInvoiceWithPlan,
    data: {
      transactionId?: string;
      payload?: Record<string, unknown>;
    },
  ): Promise<SslCommerzPaidValidationResult> {
    const payload = data.payload ?? {};
    const source = this.pickString(payload.source);
    if (
      source === 'mock_checkout' ||
      (data.transactionId && data.transactionId.startsWith('mock-tx-'))
    ) {
      return {
        valid: true,
        mode: 'mock',
        reason: 'mock_checkout',
        providerRef: data.transactionId,
      };
    }

    const storeId = this.configService.get<string>('SSLCOMMERZ_STORE_ID')?.trim();
    const storePassword = this.configService
      .get<string>('SSLCOMMERZ_STORE_PASSWORD')
      ?.trim();
    if (!storeId || !storePassword) {
      return {
        valid: true,
        mode: 'skipped',
        reason: 'credentials_missing',
        providerRef: data.transactionId,
      };
    }

    const valId =
      this.pickString(payload.val_id) ?? this.pickString(payload.valId);
    if (!valId) {
      return {
        valid: false,
        mode: 'api',
        reason: 'val_id_missing',
      };
    }

    const validationBaseUrl = this.trimTrailingSlash(
      this.configService.get<string>('SSLCOMMERZ_VALIDATION_API_BASE_URL') ??
        this.configService.get<string>('SSLCOMMERZ_API_BASE_URL') ??
        DEFAULT_SSLCOMMERZ_API_BASE_URL,
    );
    const validationPath =
      this.configService.get<string>('SSLCOMMERZ_VALIDATION_API_PATH') ??
      DEFAULT_SSLCOMMERZ_VALIDATION_API_PATH;
    const endpoint = `${validationBaseUrl}${
      validationPath.startsWith('/') ? validationPath : `/${validationPath}`
    }`;

    const query = new URLSearchParams({
      val_id: valId,
      store_id: storeId,
      store_passwd: storePassword,
      v: '1',
      format: 'json',
    });

    let response: Response;
    try {
      response = await fetch(`${endpoint}?${query.toString()}`, {
        method: 'GET',
      });
    } catch {
      return {
        valid: false,
        mode: 'api',
        reason: 'validation_api_unreachable',
      };
    }

    const result = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const gatewayStatus = this.pickString(result.status)?.toUpperCase();

    if (!response.ok) {
      return {
        valid: false,
        mode: 'api',
        reason: 'validation_api_error',
        rawStatus: gatewayStatus,
      };
    }

    if (gatewayStatus !== 'VALID' && gatewayStatus !== 'VALIDATED') {
      return {
        valid: false,
        mode: 'api',
        reason: 'validation_status_invalid',
        rawStatus: gatewayStatus,
      };
    }

    const gatewayTranId = this.pickString(result.tran_id);
    if (gatewayTranId && gatewayTranId !== invoice.id) {
      return {
        valid: false,
        mode: 'api',
        reason: 'transaction_mismatch',
        rawStatus: gatewayStatus,
      };
    }

    const gatewayAmount = this.pickNumber(result.amount);
    if (
      gatewayAmount != null &&
      Math.abs(gatewayAmount - invoice.amountBdt) > 0.01
    ) {
      return {
        valid: false,
        mode: 'api',
        reason: 'amount_mismatch',
        rawStatus: gatewayStatus,
        amountBdt: gatewayAmount,
      };
    }

    const gatewayCurrency = this.pickString(result.currency)?.toUpperCase();
    if (gatewayCurrency && gatewayCurrency !== 'BDT') {
      return {
        valid: false,
        mode: 'api',
        reason: 'currency_mismatch',
        rawStatus: gatewayStatus,
        currency: gatewayCurrency,
      };
    }

    return {
      valid: true,
      mode: 'api',
      reason: 'validated',
      valId,
      providerRef: valId,
      rawStatus: gatewayStatus,
      amountBdt: gatewayAmount,
      currency: gatewayCurrency,
    };
  }

  private buildSslCommerzCallbackUrls(backendPublicUrl: string) {
    const webhookToken = this.configService
      .get<string>('SSLCOMMERZ_WEBHOOK_SECRET')
      ?.trim();
    const successUrl =
      this.configService.get<string>('SSLCOMMERZ_SUCCESS_URL') ??
      `${backendPublicUrl}/api/webhooks/sslcommerz/subscription/success`;
    const failUrl =
      this.configService.get<string>('SSLCOMMERZ_FAIL_URL') ??
      `${backendPublicUrl}/api/webhooks/sslcommerz/subscription/fail`;
    const cancelUrl =
      this.configService.get<string>('SSLCOMMERZ_CANCEL_URL') ??
      `${backendPublicUrl}/api/webhooks/sslcommerz/subscription/cancel`;
    const ipnUrl =
      this.configService.get<string>('SSLCOMMERZ_IPN_URL') ??
      `${backendPublicUrl}/api/webhooks/sslcommerz/subscription/ipn`;

    return {
      successUrl: this.withWebhookToken(successUrl, webhookToken),
      failUrl: this.withWebhookToken(failUrl, webhookToken),
      cancelUrl: this.withWebhookToken(cancelUrl, webhookToken),
      ipnUrl: this.withWebhookToken(ipnUrl, webhookToken),
    };
  }

  private resolveOwnerBillingRedirectBaseUrl() {
    const explicit = this.configService
      .get<string>('OWNER_DASHBOARD_BILLING_URL')
      ?.trim();
    if (explicit) return explicit;
    const ownerApp = this.trimTrailingSlash(
      this.configService.get<string>('OWNER_APP_PUBLIC_URL') ??
        DEFAULT_OWNER_APP_URL,
    );
    return `${ownerApp}${DEFAULT_OWNER_DASHBOARD_BILLING_PATH}`;
  }

  private trimTrailingSlash(value: string) {
    return value.endsWith('/') ? value.slice(0, -1) : value;
  }

  private pickString(value: unknown) {
    if (typeof value !== 'string') return undefined;
    const next = value.trim();
    return next.length ? next : undefined;
  }

  private pickNumber(value: unknown) {
    const next = Number(value);
    return Number.isFinite(next) ? next : undefined;
  }

  private pickBoolean(value: unknown) {
    if (typeof value === 'boolean') return value;
    if (value === '1' || value === 'true') return true;
    if (value === '0' || value === 'false') return false;
    return undefined;
  }

  private withWebhookToken(url: string, token?: string) {
    if (!token) return url;
    let target: URL;
    try {
      target = new URL(url);
    } catch {
      return url;
    }
    target.searchParams.set('webhookToken', token);
    return target.toString();
  }

  private normalizePaymentStatus(raw?: string): WebhookPaymentStatus {
    const value = String(raw ?? '').trim().toLowerCase();
    if (!value) return 'pending';

    if (
      value === 'paid' ||
      value === 'succeeded' ||
      value === 'success' ||
      value === 'completed' ||
      value === 'valid'
    ) {
      return 'paid';
    }
    if (
      value === 'failed' ||
      value === 'fail' ||
      value === 'declined' ||
      value === 'invalid' ||
      value === 'error'
    ) {
      return 'failed';
    }
    if (value === 'cancelled' || value === 'canceled') {
      return 'cancelled';
    }
    return 'pending';
  }

  private toInvoiceStatus(paymentStatus: WebhookPaymentStatus) {
    if (paymentStatus === 'failed') return SubscriptionInvoiceStatus.failed;
    if (paymentStatus === 'cancelled') return SubscriptionInvoiceStatus.cancelled;
    if (paymentStatus === 'pending') return SubscriptionInvoiceStatus.pending;
    return SubscriptionInvoiceStatus.paid;
  }

  private async findInvoiceForWebhook(data: {
    invoiceId?: string;
    transactionId?: string;
  }) {
    if (data.invoiceId) {
      return this.prisma.subscriptionInvoice.findUnique({
        where: { id: data.invoiceId },
        include: { plan: true },
      });
    }

    if (data.transactionId) {
      return this.prisma.subscriptionInvoice.findFirst({
        where: {
          OR: [
            {
              provider: 'sslcommerz',
              providerRef: data.transactionId,
            },
            {
              id: data.transactionId,
            },
          ],
        },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return null;
  }

  private async createOrphanWebhookEvent(
    data: {
      storeId?: string;
      eventType?: string;
      transactionId?: string;
      payload?: Record<string, unknown>;
    },
    paymentStatus: WebhookPaymentStatus,
    secretValid: boolean,
  ) {
    const storeId = data.storeId?.trim();
    if (!storeId) return;

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true },
    });
    if (!store) return;

    await this.prisma.subscriptionPaymentEvent.create({
      data: {
        storeId: store.id,
        provider: 'sslcommerz',
        eventType: data.eventType,
        status: secretValid ? paymentStatus : 'rejected',
        providerRef: data.transactionId,
        payload: (data.payload ?? {}) as Prisma.InputJsonValue,
      },
    });
  }

  private asRecord(value: Prisma.JsonValue | null | undefined) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {} as Record<string, unknown>;
    }
    return value as Record<string, unknown>;
  }
}
