import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class WorkspaceAgentCollaborateDto {
  @IsString()
  @MinLength(3)
  query!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  topK?: number;
}
