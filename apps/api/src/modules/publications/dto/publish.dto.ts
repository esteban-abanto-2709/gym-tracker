import { PublicationKind } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNotIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export const RESERVED_SLUGS = ['new', 'mine', 'edit', 'publish'];

export class SlugDto {
  @IsString()
  @Length(3, 60)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  @IsNotIn(RESERVED_SLUGS)
  slug: string;
}

export class PublishDto extends SlugDto {
  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string;
}

export class RenamePublicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/\S/)
  name: string;
}

export class SlugAvailableDto extends SlugDto {
  @IsEnum(PublicationKind)
  kind: PublicationKind;
}
