import { Controller, Get } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async findAll() {
    return this.equipmentService.findAll();
  }
}
