import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import { normalizeEmail } from '../email';

export class LoginDto {
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
