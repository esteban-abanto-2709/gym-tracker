import {
  ArgumentsHost,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { RejectedRequestFilter } from './rejected-request.filter';

const hostFor = (req: object) =>
  ({
    switchToHttp: () => ({ getRequest: () => req }),
  }) as unknown as ArgumentsHost;

const request = (extra: object = {}) => ({
  method: 'POST',
  originalUrl: '/workouts',
  user: { id: '5d685f12-aaaa-bbbb-cccc-111122223333' },
  ...extra,
});

describe('RejectedRequestFilter', () => {
  let warn: jest.SpyInstance;
  let parent: jest.SpyInstance;
  const filter = new RejectedRequestFilter();

  beforeEach(() => {
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    parent = jest
      .spyOn(BaseExceptionFilter.prototype, 'catch')
      .mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('logs a validation rejection with method, path, status, user and reasons', () => {
    const error = new BadRequestException(['reps must be positive', 'bad id']);
    filter.catch(error, hostFor(request()));
    expect(warn).toHaveBeenCalledWith(
      'POST /workouts 400 user=5d685f12 reps must be positive; bad id',
    );
  });

  it('logs anon when the request has no user', () => {
    filter.catch(
      new BadRequestException('nope'),
      hostFor(request({ user: undefined })),
    );
    expect(warn).toHaveBeenCalledWith('POST /workouts 400 user=anon nope');
  });

  it('leaves the query string out of the logged path', () => {
    filter.catch(
      new BadRequestException('nope'),
      hostFor(request({ originalUrl: '/workouts?token=secret' })),
    );
    expect(warn).toHaveBeenCalledWith('POST /workouts 400 user=5d685f12 nope');
  });

  it('does not log a 401', () => {
    filter.catch(new UnauthorizedException(), hostFor(request()));
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not log a server error or an unknown error', () => {
    filter.catch(new InternalServerErrorException(), hostFor(request()));
    filter.catch(new Error('boom'), hostFor(request()));
    expect(warn).not.toHaveBeenCalled();
  });

  it('always hands the exception to the default filter', () => {
    const errors = [
      new BadRequestException('a'),
      new UnauthorizedException(),
      new Error('boom'),
    ];
    for (const e of errors) filter.catch(e, hostFor(request()));
    expect(parent).toHaveBeenCalledTimes(3);
  });
});
