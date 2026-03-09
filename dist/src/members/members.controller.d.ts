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
            id: string;
            name: string;
            isActive: boolean;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        createdAt: Date;
        storeId: string;
        userId: string;
        roleInStore: string;
    })[]>;
    invite(storeId: string, dto: InviteMemberDto, user: RequestUser): Promise<{
        createdAt: Date;
        storeId: string;
        userId: string;
        roleInStore: string;
    }>;
    updateRole(storeId: string, userId: string, dto: UpdateMemberDto, user: RequestUser): Promise<{
        createdAt: Date;
        storeId: string;
        userId: string;
        roleInStore: string;
    }>;
    remove(storeId: string, userId: string, user: RequestUser): Promise<{
        createdAt: Date;
        storeId: string;
        userId: string;
        roleInStore: string;
    }>;
}
export {};
