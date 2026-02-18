import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role, StoreStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
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
}

class UpdateSettingDto {
  @IsObject()
  valueJson!: Record<string, unknown>;
}

class UpsertSettingsBatchDto {
  @IsObject()
  values!: Record<string, Record<string, unknown>>;
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

  @Get('stores')
  @Roles(Role.super_admin, Role.ops, Role.support)
  stores() {
    return this.superAdminService.stores();
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

  @Get('subscriptions')
  @Roles(Role.super_admin, Role.finance)
  subscriptions() {
    return this.superAdminService.subscriptions();
  }

  @Get('payment-ops')
  @Roles(Role.super_admin, Role.finance)
  paymentOps() {
    return this.superAdminService.paymentOps();
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
