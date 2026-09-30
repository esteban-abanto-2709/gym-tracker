import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  routineIds: string[];
}
