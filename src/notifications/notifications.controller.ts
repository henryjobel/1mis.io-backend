import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { NotificationsService } from './notifications.service';

class SendNotificationDto {
  @IsString()
  channel!: 'email' | 'sms' | 'whatsapp';

  @IsString()
  recipient!: string;

  @IsOptional()
  @IsString()
  templateKey?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

@Controller('api/stores/:id/notifications')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  send(
    @Param('id') storeId: string,
    @Body() dto: SendNotificationDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notificationsService.send(storeId, dto, user);
  }

  @Get('logs')
  logs(@Param('id') storeId: string) {
    return this.notificationsService.logs(storeId);
  }
}
