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
  }
}
