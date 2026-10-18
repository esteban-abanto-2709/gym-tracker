import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response, CookieOptions } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { DeleteMeDto } from './dto/delete-me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from '@/common/decorators/public.decorator';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 días

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwt: JwtService,
  ) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(dto);
    await this.setAuthCookie(res, user.id);
    return user;
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto);
    await this.setAuthCookie(res, user.id);
    return user;
  }

  @Public()
  @Post('google')
  async google(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.loginWithGoogle(dto.credential);
    await this.setAuthCookie(res, user.id);
    return user;
  }

  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined;
    const payload = token
      ? await this.jwt
          .verifyAsync<{ sub: string; ver?: number }>(token)
          .catch(() => null)
      : null;
    if (payload) {
      await this.authService.revokeSessions(payload.sub, payload.ver ?? 0);
    }
    res.clearCookie(COOKIE_NAME, this.cookieOptions());
    return { ok: true };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.findById(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    return this.authService.updateMe(user.id, dto);
  }

  @UseGuards(ThrottlerGuard)
  @Patch('password')
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const updated = await this.authService.changePassword(user.id, dto);
    await this.setAuthCookie(res, user.id);
    return updated;
  }

  @UseGuards(ThrottlerGuard)
  @Delete('me')
  async deleteMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: DeleteMeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.deleteMe(user.id, dto);
    res.clearCookie(COOKIE_NAME, this.cookieOptions());
    return { ok: true };
  }

  private async setAuthCookie(res: Response, userId: string) {
    const ver = await this.authService.tokenVersion(userId);
    const token = this.jwt.sign({ sub: userId, ver });
    res.cookie(COOKIE_NAME, token, {
      ...this.cookieOptions(),
      maxAge: COOKIE_MAX_AGE,
    });
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
  }
}
