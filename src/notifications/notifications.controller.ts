import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
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

class NotificationLogsQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @IsString()
  sort?: string;
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
  logs(
    @Param('id') storeId: string,
    @Query() query: NotificationLogsQueryDto,
  ) {
    return this.notificationsService.logs(storeId, query);
  }
}
