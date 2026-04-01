import { IsBoolean, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateVariantDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isBaseline?: boolean;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, unknown>;
}
