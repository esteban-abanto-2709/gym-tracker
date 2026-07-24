import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/providers/prisma/prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.equipment.findMany({ orderBy: { name: 'asc' } });
  }
}
