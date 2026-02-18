import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StoreAccessGuard } from '../common/guards/store-access.guard';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { MembersService } from './members.service';

class InviteMemberDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  roleInStore!: string;
}

class UpdateMemberDto {
  @IsOptional()
  @IsString()
  roleInStore?: string;
}

@Controller('api/stores/:id/members')
@UseGuards(JwtAuthGuard, StoreAccessGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  list(@Param('id') storeId: string) {
    return this.membersService.list(storeId);
  }

  @Post()
  invite(
    @Param('id') storeId: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.membersService.invite(storeId, dto, user);
  }

  @Patch(':userId')
  updateRole(
    @Param('id') storeId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.membersService.updateRole(storeId, userId, dto, user);
  }

  @Delete(':userId')
  remove(
    @Param('id') storeId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.membersService.remove(storeId, userId, user);
  }
}
