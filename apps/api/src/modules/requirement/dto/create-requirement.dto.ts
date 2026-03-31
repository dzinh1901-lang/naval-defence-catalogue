import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateRequirementDto {
  @IsString()
  @MinLength(5)
  text!: string;

  @IsUUID()
  projectId!: string;
}
