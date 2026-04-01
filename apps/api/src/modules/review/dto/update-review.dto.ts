import { IsIn, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @IsIn(['OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED'])
  @IsOptional()
  status?: string;
}
