import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map } from 'rxjs';
import { localizeExerciseNames } from '@/common/locale';

@Injectable()
export class ExerciseNamesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const user = context.switchToHttp().getRequest<Request>().user;
    if (!user) return next.handle();
    return next
      .handle()
      .pipe(map((body: unknown) => localizeExerciseNames(body, user.locale)));
  }
}
