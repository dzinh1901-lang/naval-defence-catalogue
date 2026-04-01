import { IsBoolean, IsObject, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isBaseline?: boolean;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, unknown>;

  @IsUUID()
  twinId!: string;
}
