import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  updateMe(userId: string, data: { name?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }
}
