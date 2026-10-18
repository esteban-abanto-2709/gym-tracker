import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeEmail } from '../email';

export class RegisterDto {
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
