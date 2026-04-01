import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @Post()
  create(@Body() body: { title: string; projectId: string; createdById: string }) {
    return this.service.create(body);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.service.findByProject(projectId);
  }
}
