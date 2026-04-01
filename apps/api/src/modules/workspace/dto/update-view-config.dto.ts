import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateViewConfigDto {
  @IsOptional()
  @IsString()
  selectedMaterialId?: string | null;

  @IsOptional()
  @IsString()
  selectedLightingId?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(32.0)
  camDof?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(128)
  camFstop?: number;
}
