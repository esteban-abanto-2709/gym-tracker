import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import type { Locale } from '@prisma/client';
import { map } from 'rxjs';
import { localizeExerciseNames } from '@/common/locale';

@Injectable()
export class ExerciseNamesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<Request>();
    const locale: Locale =
      req.user?.exerciseLocale ||
      (req.acceptsLanguages('en', 'es') as Locale | false) ||
      'en';
    return next
      .handle()
      .pipe(map((body: unknown) => localizeExerciseNames(body, locale)));
  }
}
