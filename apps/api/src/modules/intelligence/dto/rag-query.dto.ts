import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class RagQueryDto {
  @IsString()
  @MinLength(3)
  query!: string;

  /** Maximum number of results to return (1–20, default 5). */
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  topK?: number;

  /** Optional filter: restrict search to a specific digital twin by ID. */
  @IsString()
  @IsOptional()
  twinId?: string;

  /** Optional filter: restrict search to a specific project by ID. */
  @IsString()
  @IsOptional()
  projectId?: string;
}
