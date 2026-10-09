import { ValidateIf } from 'class-validator';
import { IsPastDate } from '@/common/date-only';

export class UpdateMeDto {
  @ValidateIf((o: UpdateMeDto) => o.birthDate !== null)
  @IsPastDate()
  birthDate: string | null;
}
