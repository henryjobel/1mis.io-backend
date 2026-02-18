import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(dto: SignupDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(dto: RefreshDto): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    me(user: RequestUser): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        name: string;
        email: string;
        isActive: boolean;
    } | null>;
}
