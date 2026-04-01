import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly service: EvidenceService) {}

  /**
   * POST /api/v1/evidence
   * Add evidence to a review. Requires MEMBER or ADMIN role.
   */
  @Post()
  @Roles('MEMBER', 'ADMIN')
  create(@Body() dto: CreateEvidenceDto) {
    return this.service.create(dto);
  }

  /**
   * GET /api/v1/evidence/review/:reviewId
   * List evidence for a review.
   */
  @Get('review/:reviewId')
  findByReview(@Param('reviewId') reviewId: string) {
    return this.service.findByReview(reviewId);
  }
}
