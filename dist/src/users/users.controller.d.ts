import { RequestUser } from '../common/interfaces/request-user.interface';
import { UsersService } from './users.service';
declare class UpdateMeDto {
    name?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: RequestUser): import(".prisma/client").Prisma.Prisma__UserClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    updateMe(user: RequestUser, dto: UpdateMeDto): import(".prisma/client").Prisma.Prisma__UserClient<{
        name: string;
        id: string;
        email: string;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
