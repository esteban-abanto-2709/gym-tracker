import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import type { Response, CookieOptions } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
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
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(dto);
    this.setAuthCookie(res, user.id);
    return user;
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto);
    this.setAuthCookie(res, user.id);
    return user;
  }

  @Public()
  @Post('google')
  async google(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.loginWithGoogle(dto.credential);
    this.setAuthCookie(res, user.id);
    return user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, this.cookieOptions());
    return { ok: true };
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.findById(user.id);
  }

  private setAuthCookie(res: Response, userId: string) {
    const token = this.jwt.sign({ sub: userId });
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
