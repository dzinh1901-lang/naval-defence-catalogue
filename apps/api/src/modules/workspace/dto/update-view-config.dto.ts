import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const workspaceSections = [
  'overview',
  'vessel-layout',
  'performance-tests',
  'design-studio',
  'history-log',
  'rules-check',
  'team-hub',
] as const;

class CameraStateDto {
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  yaw?: number;

  @IsNumber()
  @Min(-40)
  @Max(40)
  @IsOptional()
  pitch?: number;

  @IsNumber()
  @Min(0.6)
  @Max(1.6)
  @IsOptional()
  zoom?: number;

  @IsNumber()
  @Min(20)
  @Max(60)
  @IsOptional()
  fieldOfView?: number;
}

export class UpdateViewConfigDto {
  @IsString()
  @IsOptional()
  selectedHotspotId?: string | null;

  @IsString()
  @IsOptional()
  selectedMaterialPresetId?: string | null;

  @IsString()
  @IsOptional()
  selectedLightingPresetId?: string | null;

  @IsString()
  @IsOptional()
  selectedCameraPresetId?: string | null;

  @IsString()
  @IsOptional()
  activeKeyframeSequenceId?: string | null;

  @IsIn(workspaceSections)
  @IsOptional()
  activeSection?: (typeof workspaceSections)[number];

  @IsObject()
  @ValidateNested()
  @Type(() => CameraStateDto)
  @IsOptional()
  cameraState?: CameraStateDto;
}
