import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { BodyMeasurement } from '@prisma/client';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { fromDbDate, isDateOnly, toDbDate } from '@/common/date-only';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';

const toPublic = ({ date, weightKg, bodyFatPct, heightCm }: BodyMeasurement) => ({
  date: fromDbDate(date),
  weightKg,
  bodyFatPct,
  heightCm,
});

@Injectable()
export class MeasurementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const rows = await this.prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return rows.map(toPublic);
  }

  async upsert(userId: string, dto: UpsertMeasurementDto) {
    const values = {
      weightKg: dto.weightKg ?? null,
      bodyFatPct: dto.bodyFatPct ?? null,
      heightCm: dto.heightCm ?? null,
    };
    if (Object.values(values).every((v) => v == null)) {
      throw new BadRequestException(
        'at least one of weightKg, bodyFatPct or heightCm is required',
      );
    }
    const date = toDbDate(dto.date);
    const row = await this.prisma.bodyMeasurement.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ...values },
      update: values,
    });
    return toPublic(row);
  }

  async remove(userId: string, date: string) {
    if (!isDateOnly(date)) throw new NotFoundException();
    const { count } = await this.prisma.bodyMeasurement.deleteMany({
      where: { userId, date: toDbDate(date) },
    });
    if (count === 0) throw new NotFoundException();
  }
}
