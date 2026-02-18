import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role, StoreStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SuperAdminService } from './super-admin.service';

class UpdateStoreStatusDto {
  @IsEnum(StoreStatus)
  status!: StoreStatus;
}

class InviteAdminDto {
  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsEnum(Role)
  role!: Role;
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
  updateStoreStatus(@Param('id') id: string, @Body() dto: UpdateStoreStatusDto) {
    return this.superAdminService.updateStoreStatus(id, dto.status);
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

  @Get('admins')
  @Roles(Role.super_admin)
  admins() {
    return this.superAdminService.admins();
  }

  @Post('admins/invite')
  @Roles(Role.super_admin)
  inviteAdmin(@Body() dto: InviteAdminDto) {
    return this.superAdminService.inviteAdmin(dto);
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
  upsertFlag(@Param('key') key: string, @Body() dto: UpdateFlagDto) {
    return this.superAdminService.upsertFlag(key, dto.enabled, dto.description);
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
  upsertSetting(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.superAdminService.upsertSetting(key, dto.valueJson);
  }
}
