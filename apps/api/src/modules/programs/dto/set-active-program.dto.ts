import { IsOptional, IsUUID } from 'class-validator';

export class SetActiveProgramDto {
  @IsOptional()
  @IsUUID()
  programId: string | null;
}
