import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    me(userId: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    updateMe(userId: string, data: {
        name?: string;
    }): import(".prisma/client").Prisma.Prisma__UserClient<{
        name: string;
        id: string;
        email: string;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
