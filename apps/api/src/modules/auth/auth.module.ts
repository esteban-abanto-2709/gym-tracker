import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 5 }],
      getTracker: (req: { headers: Record<string, unknown>; ip?: string }) =>
        (req.headers['cf-connecting-ip'] as string) ?? req.ip ?? '',
      errorMessage: 'Demasiados intentos. Espera un minuto y vuelve a probar.',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
