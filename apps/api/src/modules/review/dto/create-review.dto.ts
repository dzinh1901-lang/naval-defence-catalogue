import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['DESIGN', 'SAFETY', 'COMPLIANCE', 'INTERFACE'])
  @IsOptional()
  type?: string;

  @IsUUID()
  projectId!: string;

  @IsUUID()
  createdById!: string;
}
