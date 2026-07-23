import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { EQUIPMENT } from '../equipment';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(EQUIPMENT)
  equipment: string;
}
