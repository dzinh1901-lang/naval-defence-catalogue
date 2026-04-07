import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { RequestUser } from '../../common/types/request-user.type';
import { UpdateViewConfigDto } from './dto/update-view-config.dto';
import { WorkspaceAgentCollaborateDto } from './dto/workspace-agent-collaborate.dto';
import { WorkspaceService } from './workspace.service';
import { Body, Controller, Get, NotFoundException, Param, Patch } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { UpdateViewConfigDto } from './dto/update-view-config.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly service: WorkspaceService) {}

  @Get(':twinId')
  async getSummary(@Param('twinId') twinId: string, @CurrentUser() user: RequestUser) {
    const summary = await this.service.getSummary(twinId, user.organizationId);
    if (!summary) {
      throw new NotFoundException(`Workspace twin ${twinId} not found`);
    }

    return summary;
  }

  @Get(':twinId/alerts')
  getAlerts(@Param('twinId') twinId: string, @CurrentUser() user: RequestUser) {
    return this.service.getAlerts(twinId, user.organizationId);
  }

  @Get(':twinId/history')
  getHistory(@Param('twinId') twinId: string, @CurrentUser() user: RequestUser) {
    return this.service.getHistory(twinId, user.organizationId);
  }

  @Get(':twinId/view-config')
  getViewConfig(@Param('twinId') twinId: string, @CurrentUser() user: RequestUser) {
    return this.service.getViewConfig(twinId, user.organizationId);
  }

  @Patch(':twinId/view-config')
  @Roles('MEMBER', 'ADMIN')
  updateViewConfig(
    @Param('twinId') twinId: string,
    @Body() dto: UpdateViewConfigDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.service.updateViewConfig(twinId, user.organizationId, dto);
  }

  @Get(':twinId/hotspots')
  getHotspots(@Param('twinId') twinId: string, @CurrentUser() user: RequestUser) {
    return this.service.getHotspots(twinId, user.organizationId);
  }

  @Get(':twinId/performance')
  getPerformance(@Param('twinId') twinId: string, @CurrentUser() user: RequestUser) {
    return this.service.getPerformance(twinId, user.organizationId);
  }

  @Get(':twinId/rules')
  getRules(@Param('twinId') twinId: string, @CurrentUser() user: RequestUser) {
    return this.service.getRules(twinId, user.organizationId);
  }

  @Get(':twinId/team')
  getTeam(@Param('twinId') twinId: string, @CurrentUser() user: RequestUser) {
    return this.service.getTeam(twinId, user.organizationId);
  }

  @Get(':twinId/dashboard')
  getDashboard(@Param('twinId') twinId: string, @CurrentUser() user: RequestUser) {
    return this.service.getDashboard(twinId, user.organizationId);
  }

  @Post(':twinId/agent/collaborate')
  @Roles('MEMBER', 'ADMIN')
  collaborateWithAgent(
    @Param('twinId') twinId: string,
    @Body() dto: WorkspaceAgentCollaborateDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.service.collaborateWithAgent(twinId, user.organizationId, dto);
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
