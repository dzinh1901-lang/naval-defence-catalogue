import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { RagQueryDto } from './dto/rag-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('intelligence')
export class IntelligenceController {
  constructor(private readonly service: IntelligenceService) {}

  /**
   * POST /api/v1/intelligence/rag
   *
   * Semantic (RAG) search across subsystems, variants, and evidence.
   * Accepts a natural-language query and returns the top-K ranked results.
   * Requires at least VIEWER role.
   */
  @Post('rag')
  ragQuery(@Body() dto: RagQueryDto) {
    return this.service.ragQuery(dto);
  }

  /**
   * GET /api/v1/intelligence/rag?query=...&topK=5&twinId=...&projectId=...
   *
   * Convenience GET variant of the RAG search for quick tooling/testing.
   */
  @Get('rag')
  ragQueryGet(
    @Query('query') query: string,
    @Query('topK') topK?: string,
    @Query('twinId') twinId?: string,
    @Query('projectId') projectId?: string,
  ) {
    const dto: RagQueryDto = {
      query: query ?? '',
      ...(topK !== undefined ? { topK: parseInt(topK, 10) } : {}),
      ...(twinId !== undefined ? { twinId } : {}),
      ...(projectId !== undefined ? { projectId } : {}),
    };
    return this.service.ragQuery(dto);
  }

  /**
   * POST /api/v1/intelligence/reviews/:reviewId/summarize
   *
   * Auto-summarise the evidence of a review and suggest compliance / risk
   * scores.  Requires MEMBER or ADMIN role.
   */
  @Post('reviews/:reviewId/summarize')
  @Roles('MEMBER', 'ADMIN')
  autoSummarize(@Param('reviewId') reviewId: string) {
    return this.service.autoSummarize(reviewId);
  }
}
