import { RequestUser } from '../common/interfaces/request-user.interface';
import { UsersService } from './users.service';
declare class UpdateMeDto {
    name?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: RequestUser): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    updateMe(user: RequestUser, dto: UpdateMeDto): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
