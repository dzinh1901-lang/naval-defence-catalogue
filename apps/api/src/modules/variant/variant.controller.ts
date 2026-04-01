import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { VariantService } from './variant.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../../common/types/request-user.type';

@Controller('variants')
export class VariantController {
  constructor(private readonly service: VariantService) {}

  /**
   * POST /api/v1/variants
   * Create a new variant for a digital twin. Requires MEMBER or ADMIN role.
   */
  @Post()
  @Roles('MEMBER', 'ADMIN')
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
   * Get a single variant by ID, scoped to the authenticated user's organization.
   */
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.service.findOne(id, user.organizationId);
  }

  /**
   * PATCH /api/v1/variants/:id
   * Update a variant. Requires MEMBER or ADMIN role.
   */
  @Patch(':id')
  @Roles('MEMBER', 'ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateVariantDto, @CurrentUser() user: RequestUser) {
    return this.service.update(id, user.organizationId, dto);
  }

  /**
   * DELETE /api/v1/variants/:id
   * Delete a variant. Requires ADMIN role.
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.service.remove(id, user.organizationId);
  }
}
