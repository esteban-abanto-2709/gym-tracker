import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import type { AuthUser } from '@/common/decorators/current-user.decorator';
import { PrismaService } from '@/providers/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest<Request>();
    const user = await this.resolveUser(req);
    if (!user && !isPublic) throw new UnauthorizedException();
    if (user) req.user = user;
    return true;
  }

  private async resolveUser(req: Request): Promise<AuthUser | null> {
    const token = req.cookies?.token as string | undefined;
    if (!token) return null;

    let payload: { sub: string; ver?: number };
    try {
      payload = await this.jwt.verifyAsync(token);
    } catch {
      return null;
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { exerciseLocale: true, tokenVersion: true },
    });
    if (!user || (payload.ver ?? 0) !== user.tokenVersion) return null;
    return { id: payload.sub, exerciseLocale: user.exerciseLocale };
  }
}
