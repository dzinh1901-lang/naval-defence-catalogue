import { Body, Controller, Get, NotFoundException, Param, Patch } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { UpdateViewConfigDto } from './dto/update-view-config.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly service: WorkspaceService) {}

  /**
   * GET /api/v1/workspace/:twinId
   * Full workspace summary: twin, project, view-config, counts, presets.
   */
  @Get(':twinId')
  @Roles('VIEWER', 'MEMBER', 'ADMIN')
  async getSummary(@Param('twinId') twinId: string) {
    const summary = await this.service.getSummary(twinId);
    if (!summary.twin) throw new NotFoundException(`DigitalTwin ${twinId} not found`);
    return summary;
  }


  /**
   * GET /api/v1/workspace/:twinId/performance
   * Performance/simulation overview.
   */
  @Get(':twinId/performance')
  @Roles('VIEWER', 'MEMBER', 'ADMIN')
  getPerformanceSummary(@Param('twinId') twinId: string) {
    return this.service.getPerformanceSummary(twinId);
  }

  /**
   * GET /api/v1/workspace/:twinId/rules
   * Requirement compliance / rules summary.
   */
  @Get(':twinId/rules')
  @Roles('VIEWER', 'MEMBER', 'ADMIN')
  getRulesSummary(@Param('twinId') twinId: string) {
    return this.service.getRulesSummary(twinId);
  }

  /**
   * GET /api/v1/workspace/:twinId/team
   * Team membership and recent activity summary.
   */
  @Get(':twinId/team')
  @Roles('VIEWER', 'MEMBER', 'ADMIN')
  async getTeamSummary(@Param('twinId') twinId: string) {
    const summary = await this.service.getSummary(twinId);
    return summary.teamSummary;
  }

  /**
   * GET /api/v1/workspace/:twinId/hotspots
   * Viewport hotspot definitions for the vessel.
   */
  @Get(':twinId/hotspots')
  @Roles('VIEWER', 'MEMBER', 'ADMIN')
  getHotspots(@Param('twinId') twinId: string) {
    return this.service.getHotspots(twinId);
  }

  /**
   * GET /api/v1/workspace/:twinId/alerts
   * Active alert events for the twin.
   */
  @Get(':twinId/alerts')
  @Roles('VIEWER', 'MEMBER', 'ADMIN')
  getAlerts(@Param('twinId') twinId: string) {
    return this.service.getAlerts(twinId);
  }

  /**
   * GET /api/v1/workspace/:twinId/history
   * Activity log / history feed for the twin.
   */
  @Get(':twinId/history')
  @Roles('VIEWER', 'MEMBER', 'ADMIN')
  getHistory(@Param('twinId') twinId: string) {
    return this.service.getHistory(twinId);
  }

  /**
   * GET /api/v1/workspace/:twinId/view-config
   * Current viewport / design-studio configuration.
   * Returns null (200) when no config has been saved yet — callers apply defaults.
   */
  @Get(':twinId/view-config')
  @Roles('VIEWER', 'MEMBER', 'ADMIN')
  getViewConfig(@Param('twinId') twinId: string) {
    return this.service.getViewConfig(twinId);
  }

  /**
   * PATCH /api/v1/workspace/:twinId/view-config
   * Persist material / lighting / camera selection.
   * Requires MEMBER or ADMIN role.
   */
  @Patch(':twinId/view-config')
  @Roles('MEMBER', 'ADMIN')
  updateViewConfig(
    @Param('twinId') twinId: string,
    @Body() dto: UpdateViewConfigDto,
  ) {
    return this.service.updateViewConfig(twinId, dto);
  }
}
