import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Request } from 'express';

@Catch()
export class RejectedRequestFilter extends BaseExceptionFilter {
  private readonly rejections = new Logger('RejectedRequest');

  catch(exception: unknown, host: ArgumentsHost) {
    if (
      exception instanceof HttpException &&
      exception.getStatus() >= 400 &&
      exception.getStatus() < 500 &&
      exception.getStatus() !== 401
    ) {
      const req = host.switchToHttp().getRequest<Request>();
      const user = req.user;
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : (body as { message?: string | string[] }).message;
      const reason = Array.isArray(message)
        ? message.join('; ')
        : (message ?? exception.message);
      const path = req.originalUrl.split('?')[0];
      this.rejections.warn(
        `${req.method} ${path} ${exception.getStatus()} user=${user?.id.slice(0, 8) ?? 'anon'} ${reason}`,
      );
    }
    super.catch(exception, host);
  }
}
