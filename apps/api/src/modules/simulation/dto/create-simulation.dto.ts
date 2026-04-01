import { IsIn, IsObject, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSimulationDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['STATIC', 'DYNAMIC', 'MONTE_CARLO'])
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsUUID()
  twinId!: string;
}
