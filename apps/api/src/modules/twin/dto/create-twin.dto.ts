import { IsString, IsUUID } from 'class-validator';

export class CreateTwinDto {
  @IsString()
  name!: string;

  @IsUUID()
  projectId!: string;
}
