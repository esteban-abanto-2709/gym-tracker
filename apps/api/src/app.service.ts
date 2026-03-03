import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './providers/prisma/prisma.service';
import packageJson from '../package.json';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealthz() {
    const uptime = process.uptime();
    try {
      await this.prisma.$executeRawUnsafe('SELECT 1');

      return {
        status: 'ok',
        version: packageJson.version,
        uptime: `${Math.floor(uptime)}s`,
        timestamp: new Date().toISOString(),
        service: 'GymTracker API',
        database: {
          status: 'connected',
          type: 'PostgreSQL',
        },
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'error',
        version: packageJson.version,
        uptime: `${Math.floor(uptime)}s`,
        timestamp: new Date().toISOString(),
        service: 'GymTracker API',
        database: {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}
