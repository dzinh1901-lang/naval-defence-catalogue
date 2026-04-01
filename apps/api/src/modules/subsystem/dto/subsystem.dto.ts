import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateSubsystemDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  identifier!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  twinId!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateSubsystemDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'DEFINED', 'VERIFIED', 'DEPRECATED'])
  status?: string;
}
