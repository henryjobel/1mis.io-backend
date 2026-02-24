import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      } as any,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(
    userId: string,
    data: { name?: string; businessName?: string; email?: string },
  ) {
    const nextEmail = data.email?.trim().toLowerCase();
    if (nextEmail) {
      const existing = await this.prisma.user.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const next = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.businessName !== undefined
        ? { businessName: data.businessName }
        : {}),
      ...(nextEmail !== undefined ? { email: nextEmail } : {}),
    };
    return this.prisma.user.update({
      where: { id: userId },
      data: next,
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        role: true,
        isActive: true,
      } as any,
    });
  }
}
