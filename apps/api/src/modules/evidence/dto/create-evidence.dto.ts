import { IsIn, IsOptional, IsString, IsUUID, IsUrl, MinLength } from 'class-validator';

export class CreateEvidenceDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['DOCUMENT', 'TEST_RESULT', 'ANALYSIS', 'SIMULATION_RESULT', 'PHOTO'])
  @IsOptional()
  type?: string;

  @IsString()
  @IsUrl({ require_tld: false })
  uri!: string;

  @IsUUID()
  reviewId!: string;
}
