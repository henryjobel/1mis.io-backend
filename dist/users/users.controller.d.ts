import { RequestUser } from '../common/interfaces/request-user.interface';
import { UsersService } from './users.service';
declare class UpdateMeDto {
    name?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateMe(user: RequestUser, dto: UpdateMeDto): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        name: string;
        email: string;
        isActive: boolean;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
export {};
