import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export const EXPLORE_SORTS = ['likes', 'copies', 'recent'] as const;
export type ExploreSort = (typeof EXPLORE_SORTS)[number];

export class ExploreQueryDto {
  @IsOptional()
  @IsIn(EXPLORE_SORTS)
  sort: ExploreSort = 'likes';
}

export class CopyProgramDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  routinePosition?: number;
}
