import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { VariantService } from './variant.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Controller('variants')
export class VariantController {
  constructor(private readonly service: VariantService) {}

  /**
   * POST /api/v1/variants
   * Create a new variant for a digital twin.
   */
  @Post()
  create(@Body() dto: CreateVariantDto) {
    return this.service.create(dto);
  }

  /**
   * GET /api/v1/variants/twin/:twinId
   * List all variants for a digital twin.
   */
  @Get('twin/:twinId')
  findByTwin(@Param('twinId') twinId: string) {
    return this.service.findByTwin(twinId);
  }

  /**
   * GET /api/v1/variants/:id
   * Get a single variant by ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * PATCH /api/v1/variants/:id
   * Update a variant.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.service.update(id, dto);
  }

  /**
   * DELETE /api/v1/variants/:id
   * Delete a variant.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
