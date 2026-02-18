import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';
export interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): {
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
    };
}
export {};
