import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EvidenceService } from './evidence.service';

@Controller('evidence')
export class EvidenceController {
  constructor(private service: EvidenceService) {}

  @Post()
  create(@Body() body: { reviewId: string; uri: string }) {
    return this.service.create(body);
  }

  @Get('review/:reviewId')
  findByReview(@Param('reviewId') reviewId: string) {
    return this.service.findByReview(reviewId);
  }
}
