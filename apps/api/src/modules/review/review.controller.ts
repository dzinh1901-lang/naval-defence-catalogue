import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  /**
   * POST /api/v1/reviews
   * Create a new review for a project. Requires MEMBER or ADMIN role.
   */
  @Post()
  @Roles('MEMBER', 'ADMIN')
  create(@Body() dto: CreateReviewDto) {
    return this.service.create(dto);
  }

  /**
   * GET /api/v1/reviews/project/:projectId
   * List reviews for a project (includes evidence and creator).
   */
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }

  /**
   * GET /api/v1/reviews/:id
   * Get a single review by ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * PATCH /api/v1/reviews/:id
   * Update review status. Requires MEMBER or ADMIN role.
   */
  @Patch(':id')
  @Roles('MEMBER', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.service.update(id, dto);
  }
}
