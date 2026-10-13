import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import type { Locale } from '@prisma/client';

export interface AuthUser {
  id: string;
  exerciseLocale: Locale;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.user as AuthUser;
  },
);
