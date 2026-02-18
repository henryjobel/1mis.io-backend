import { RequestUser } from '../common/interfaces/request-user.interface';
import { MembersService } from './members.service';
declare class InviteMemberDto {
    name: string;
    email: string;
    roleInStore: string;
}
declare class UpdateMemberDto {
    roleInStore?: string;
}
export declare class MembersController {
    private readonly membersService;
    constructor(membersService: MembersService);
    list(storeId: string): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            name: string;
            id: string;
            email: string;
            isActive: boolean;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        storeId: string;
        createdAt: Date;
        userId: string;
        roleInStore: string;
    })[]>;
    invite(storeId: string, dto: InviteMemberDto, user: RequestUser): Promise<{
        storeId: string;
        createdAt: Date;
        userId: string;
        roleInStore: string;
    }>;
    updateRole(storeId: string, userId: string, dto: UpdateMemberDto, user: RequestUser): Promise<{
        storeId: string;
        createdAt: Date;
        userId: string;
        roleInStore: string;
    }>;
    remove(storeId: string, userId: string, user: RequestUser): Promise<{
        storeId: string;
        createdAt: Date;
        userId: string;
        roleInStore: string;
    }>;
}
export {};
