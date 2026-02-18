import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestUser } from '../interfaces/request-user.interface';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestUser | undefined => {
    const req = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    return req.user;
  },
);
