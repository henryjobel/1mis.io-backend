import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role, StoreStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsIn,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { SuperAdminService } from './super-admin.service';

class UpdateStoreStatusDto {
  @IsEnum(StoreStatus)
  status!: StoreStatus;
}

class CreateStoreDto {
  @IsString()
  name!: string;

  @IsEmail()
  ownerEmail!: string;

  @IsOptional()
  @IsIn(['Starter', 'Growth', 'Scale'])
  plan?: 'Starter' | 'Growth' | 'Scale';

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsIn(['active', 'trial', 'suspended'])
  status?: 'active' | 'trial' | 'suspended';
}

class UpdateLifecycleDto {
  @IsOptional()
  @IsString()
  publishStatus?: string;

  @IsOptional()
  @IsString()
  domainStatus?: string;

  @IsOptional()
  @IsString()
  sslStatus?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class InviteAdminDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsEnum(Role)
  role!: Role;
}

class UpdatePaymentOpsDto {
  @IsOptional()
  @IsBoolean()
  stripeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  sslCommerzEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  codEnabled?: boolean;

  @IsOptional()
  @IsIn(['test', 'live'])
  mode?: 'test' | 'live';
}

class UpdateTicketDto {
  @IsIn(['open', 'in_progress', 'resolved'])
  status!: 'open' | 'in_progress' | 'resolved';

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';
}

class UpdateFlagDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPct?: number;
}

class UpdateSettingDto {
  @IsObject()
  valueJson!: Record<string, unknown>;
}

class UpsertSettingsBatchDto {
  @IsObject()
  values!: Record<string, Record<string, unknown>>;
}

class SubscriptionUpdateDto {
  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsIn(['active', 'trial', 'past_due', 'cancelled'])
  status?: 'active' | 'trial' | 'past_due' | 'cancelled';

  @IsOptional()
  @IsISO8601()
  nextBillingDate?: string;

  @IsOptional()
  @IsISO8601()
  expiryDate?: string;
}

class UpdateAdminStatusDto {
  @IsBoolean()
  isActive!: boolean;
}

class OverviewMetricsQueryDto {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}

@Controller('api/super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('overview')
  @Roles(Role.super_admin, Role.ops, Role.finance)
  overview() {
    return this.superAdminService.overview();
  }

  @Get('overview/metrics')
  @Roles(Role.super_admin, Role.ops, Role.finance)
  overviewMetrics(@Query() query: OverviewMetricsQueryDto) {
    return this.superAdminService.overviewMetrics(query.from, query.to);
  }

  @Get('stores')
  @Roles(Role.super_admin, Role.ops, Role.support)
  stores() {
    return this.superAdminService.stores();
  }

  @Post('stores')
  @Roles(Role.super_admin, Role.ops)
  createStore(@Body() dto: CreateStoreDto, @CurrentUser() user: RequestUser) {
    return this.superAdminService.createStore(dto, user);
  }

  @Patch('stores/:id/status')
  @Roles(Role.super_admin, Role.ops)
  updateStoreStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStoreStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.updateStoreStatus(id, dto.status, user);
  }

  @Delete('stores/:id')
  @Roles(Role.super_admin)
  deleteStore(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.superAdminService.deleteStore(id, user);
  }

  @Get('lifecycle')
  @Roles(Role.super_admin, Role.ops, Role.support)
  lifecycle() {
    return this.superAdminService.lifecycle();
  }

  @Get('lifecycle/:storeId')
  @Roles(Role.super_admin, Role.ops, Role.support)
  lifecycleByStore(@Param('storeId') storeId: string) {
    return this.superAdminService.lifecycleByStore(storeId);
  }

  @Patch('lifecycle/:storeId')
  @Roles(Role.super_admin, Role.ops)
  updateLifecycle(
    @Param('storeId') storeId: string,
    @Body() dto: UpdateLifecycleDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.updateLifecycle(storeId, dto, user);
  }

  @Get('admins')
  @Roles(Role.super_admin)
  admins() {
    return this.superAdminService.admins();
  }

  @Post('admins/invite')
  @Roles(Role.super_admin)
  inviteAdmin(@Body() dto: InviteAdminDto, @CurrentUser() user: RequestUser) {
    return this.superAdminService.inviteAdmin(dto, user);
  }

  @Patch('admins/:id/status')
  @Roles(Role.super_admin)
  updateAdminStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdminStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.updateAdminStatus(id, dto.isActive, user);
  }

  @Post('admins/:id/reset-password')
  @Roles(Role.super_admin)
  resetAdminPassword(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.resetAdminPassword(id, user);
  }

  @Post('admins/:id/resend-invite')
  @Roles(Role.super_admin)
  resendAdminInvite(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.superAdminService.resendAdminInvite(id, user);
  }

  @Get('subscriptions')
  @Roles(Role.super_admin, Role.finance)
  subscriptions() {
    return this.superAdminService.subscriptions();
  }

  @Get('subscriptions/:storeId')
  @Roles(Role.super_admin, Role.finance)
  subscriptionByStore(@Param('storeId') storeId: string) {
    return this.superAdminService.subscriptionByStore(storeId);
  }

  @Patch('subscriptions/:storeId')
  @Roles(Role.super_admin, Role.finance)
  updateSubscription(
    @Param('storeId') storeId: string,
    @Body() dto: SubscriptionUpdateDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.updateSubscription(storeId, dto, user);
  }

  @Post('subscriptions/:storeId/retry')
  @Roles(Role.super_admin, Role.finance)
  retrySubscription(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.retrySubscription(storeId, user);
  }

  @Post('subscriptions/:storeId/cancel')
  @Roles(Role.super_admin, Role.finance)
  cancelSubscription(
    @Param('storeId') storeId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.cancelSubscription(storeId, user);
  }

  @Get('payment-ops')
  @Roles(Role.super_admin, Role.finance)
  paymentOps() {
    return this.superAdminService.paymentOps();
  }

  @Get('payment-ops/metrics')
  @Roles(Role.super_admin, Role.finance, Role.ops)
  paymentOpsMetrics() {
    return this.superAdminService.paymentOpsMetrics();
  }

  @Get('payment-ops/:storeId')
  @Roles(Role.super_admin, Role.finance)
  paymentOpsByStore(@Param('storeId') storeId: string) {
    return this.superAdminService.paymentOpsByStore(storeId);
  }

  @Patch('payment-ops/:storeId')
  @Roles(Role.super_admin, Role.finance, Role.ops)
  updatePaymentOps(
    @Param('storeId') storeId: string,
    @Body() dto: UpdatePaymentOpsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.updatePaymentOps(storeId, dto, user);
  }

  @Get('tickets')
  @Roles(Role.super_admin, Role.support)
  tickets() {
    return this.superAdminService.tickets();
  }

  @Get('tickets/:id')
  @Roles(Role.super_admin, Role.support)
  ticket(@Param('id') id: string) {
    return this.superAdminService.ticket(id);
  }

  @Patch('tickets/:id')
  @Roles(Role.super_admin, Role.support, Role.ops)
  updateTicket(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.updateTicket(id, dto, user);
  }

  @Get('health')
  @Roles(Role.super_admin, Role.ops)
  health() {
    return this.superAdminService.health();
  }

  @Post('health/:service/restart')
  @Roles(Role.super_admin, Role.ops)
  restartService(@Param('service') service: string) {
    return this.superAdminService.restartService(service);
  }

  @Get('ai-usage')
  @Roles(Role.super_admin, Role.ops)
  aiUsage() {
    return this.superAdminService.aiUsage();
  }

  @Get('flags')
  @Roles(Role.super_admin, Role.ops)
  flags() {
    return this.superAdminService.flags();
  }

  @Patch('flags/:key')
  @Roles(Role.super_admin, Role.ops)
  upsertFlag(
    @Param('key') key: string,
    @Body() dto: UpdateFlagDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.upsertFlag(
      key,
      dto.enabled,
      dto.description,
      dto.rolloutPct,
      user,
    );
  }

  @Get('audit-logs')
  @Roles(Role.super_admin, Role.ops, Role.finance, Role.support)
  auditLogs() {
    return this.superAdminService.auditLogs();
  }

  @Get('settings')
  @Roles(Role.super_admin, Role.ops)
  settings() {
    return this.superAdminService.settings();
  }

  @Patch('settings/:key')
  @Roles(Role.super_admin, Role.ops)
  upsertSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.upsertSetting(key, dto.valueJson, user);
  }

  @Put('settings')
  @Roles(Role.super_admin, Role.ops)
  upsertSettingsBatch(
    @Body() dto: UpsertSettingsBatchDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.superAdminService.upsertSettingsBatch(dto.values, user);
  }
}
