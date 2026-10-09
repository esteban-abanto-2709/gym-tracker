import { BadRequestException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { MeasurementsService } from './measurements.service';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';
import { UpdateMeDto } from '../auth/dto/update-me.dto';
import { PrismaService } from '@/providers/prisma/prisma.service';
import { toLocalDateString } from '@/common/timezone.util';

const setup = () => {
  const bodyMeasurement = {
    upsert: jest.fn(({ create }: { create: object }) =>
      Promise.resolve({ ...create }),
    ),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
  const service = new MeasurementsService({
    bodyMeasurement,
  } as unknown as PrismaService);
  return { service, bodyMeasurement };
};

describe('MeasurementsService', () => {
  it('guarda una medida con un solo dato y la devuelve con fecha simple', async () => {
    const { service, bodyMeasurement } = setup();

    const saved = await service.upsert('u1', {
      date: '2026-10-08',
      weightKg: 77.9,
    });

    expect(saved).toEqual({
      date: '2026-10-08',
      weightKg: 77.9,
      bodyFatPct: null,
      heightCm: null,
    });
    const arg = bodyMeasurement.upsert.mock.calls[0][0] as {
      where: { userId_date: { userId: string; date: Date } };
      update: object;
    };
    expect(arg.where.userId_date.date.toISOString()).toBe(
      '2026-10-08T00:00:00.000Z',
    );
    expect(arg.update).toEqual({
      weightKg: 77.9,
      bodyFatPct: null,
      heightCm: null,
    });
  });

  it('rechaza una medida sin ningun dato', async () => {
    const { service, bodyMeasurement } = setup();
    await expect(
      service.upsert('u1', { date: '2026-10-08', weightKg: null }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(bodyMeasurement.upsert).not.toHaveBeenCalled();
  });

  it('borrar una fecha sin medida o mal escrita da 404', async () => {
    const { service, bodyMeasurement } = setup();
    await expect(service.remove('u1', 'ayer')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    bodyMeasurement.deleteMany.mockResolvedValueOnce({ count: 0 });
    await expect(service.remove('u1', '2026-10-01')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('UpsertMeasurementDto', () => {
  const errorsFor = async (payload: Record<string, unknown>) =>
    (await validate(plainToInstance(UpsertMeasurementDto, payload))).map(
      (e) => e.property,
    );

  it('acepta cualquier combinacion de datos opcionales', async () => {
    expect(await errorsFor({ date: '2026-10-08', heightCm: 172 })).toEqual([]);
    expect(
      await errorsFor({ date: '2026-10-08', weightKg: 77.9, bodyFatPct: 18.2 }),
    ).toEqual([]);
  });

  it('rechaza fechas futuras, imposibles o mal formadas', async () => {
    const tomorrow = new Date(Date.now() + 2 * 86_400_000);
    for (const date of [
      toLocalDateString(tomorrow),
      '2026-02-30',
      '08/10/2026',
    ]) {
      expect(await errorsFor({ date, weightKg: 70 })).toContain('date');
    }
  });

  it('rechaza valores fuera de rango', async () => {
    const errors = await errorsFor({
      date: '2026-10-08',
      weightKg: 5,
      bodyFatPct: 90,
      heightCm: 20,
    });
    expect(errors).toEqual(['weightKg', 'bodyFatPct', 'heightCm']);
  });
});

describe('UpdateMeDto', () => {
  const errorsFor = async (payload: Record<string, unknown>) =>
    validate(plainToInstance(UpdateMeDto, payload));

  it('acepta una fecha de nacimiento o null para borrarla', async () => {
    expect(await errorsFor({ birthDate: '1997-09-27' })).toHaveLength(0);
    expect(await errorsFor({ birthDate: null })).toHaveLength(0);
  });

  it('exige el campo y rechaza fechas futuras', async () => {
    expect(await errorsFor({})).toHaveLength(1);
    expect(await errorsFor({ birthDate: '2999-01-01' })).toHaveLength(1);
  });
});
