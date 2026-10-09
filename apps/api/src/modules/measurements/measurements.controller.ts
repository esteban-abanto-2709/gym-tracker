import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';
import {
  CurrentUser,
  type AuthUser,
} from '@/common/decorators/current-user.decorator';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return this.measurementsService.findAll(user.id);
  }

  @Put()
  async upsert(
    @CurrentUser() user: AuthUser,
    @Body() upsertMeasurementDto: UpsertMeasurementDto,
  ) {
    return this.measurementsService.upsert(user.id, upsertMeasurementDto);
  }

  @Delete(':date')
  async remove(@CurrentUser() user: AuthUser, @Param('date') date: string) {
    await this.measurementsService.remove(user.id, date);
    return { ok: true };
  }
}
