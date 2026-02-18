import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    updateMe(userId: string, data: {
        name?: string;
    }): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        name: string;
        email: string;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
