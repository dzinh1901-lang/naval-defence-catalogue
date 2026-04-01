import { IsString } from 'class-validator';

export class AutoSummarizeDto {
  /** ID of the review whose evidence should be auto-summarised. */
  @IsString()
  reviewId!: string;
}
