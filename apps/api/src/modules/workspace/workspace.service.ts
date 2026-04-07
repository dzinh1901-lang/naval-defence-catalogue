import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateViewConfigDto } from './dto/update-view-config.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  /** GET /workspace/:twinId — full workspace summary */
  async getSummary(twinId: string) {
    const [twin, alertCount, hotspotCount, activityCount, materialPresets, lightingPresets] =
      await Promise.all([
        this.prisma.digitalTwin.findFirst({
          where: { id: twinId },
          include: {
            project: { select: { id: true, name: true, slug: true, organizationId: true } },
            viewConfig: {
              include: {
                selectedMaterial: true,
                selectedLighting: true,
              },
            },
          },
        }),
        this.prisma.alertEvent.count({ where: { twinId, resolvedAt: null } }),
        this.prisma.viewportHotspot.count({ where: { twinId } }),
        this.prisma.twinActivityLog.count({ where: { twinId } }),
        this.prisma.materialPreset.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.lightingPreset.findMany({ orderBy: { name: 'asc' } }),
      ]);

    const [performanceSummary, rulesSummary, teamSummary] = await Promise.all([
      this.getPerformanceSummary(twinId),
      this.getRulesSummary(twinId),
      this.getTeamSummary(twin?.projectId ?? ''),
    ]);

    return {
      twin,
      project: twin?.project ?? null,
      viewConfig: twin?.viewConfig ?? null,
      alertCount,
      hotspotCount,
      activityCount,
      materialPresets,
      lightingPresets,
      performanceSummary,
      rulesSummary,
      teamSummary,
    };
  }

  /** GET /workspace/:twinId/performance */
  async getPerformanceSummary(twinId: string) {
    const [totalSimulations, completedRuns, runningRuns, failedRuns] = await Promise.all([
      this.prisma.simulation.count({ where: { twinId } }),
      this.prisma.simulationRun.count({
        where: { simulation: { twinId }, status: 'COMPLETED' },
      }),
      this.prisma.simulationRun.count({
        where: { simulation: { twinId }, status: 'RUNNING' },
      }),
      this.prisma.simulationRun.count({
        where: { simulation: { twinId }, status: 'FAILED' },
      }),
    ]);

    const assessedRuns = completedRuns + failedRuns;
    const passRate = assessedRuns === 0 ? 0 : Number(((completedRuns / assessedRuns) * 100).toFixed(1));

    return {
      totalSimulations,
      completedRuns,
      runningRuns,
      failedRuns,
      passRate,
    };
  }

  /** GET /workspace/:twinId/rules */
  async getRulesSummary(twinId: string) {
    const twin = await this.prisma.digitalTwin.findUnique({
      where: { id: twinId },
      select: { projectId: true },
    });

    if (!twin) {
      return {
        approvedRequirements: 0,
        reviewRequirements: 0,
        rejectedRequirements: 0,
        complianceScore: 0,
      };
    }

    const [approvedRequirements, reviewRequirements, rejectedRequirements] = await Promise.all([
      this.prisma.requirement.count({ where: { projectId: twin.projectId, status: 'APPROVED' } }),
      this.prisma.requirement.count({ where: { projectId: twin.projectId, status: 'REVIEW' } }),
      this.prisma.requirement.count({ where: { projectId: twin.projectId, status: 'REJECTED' } }),
    ]);

    const denominator = approvedRequirements + reviewRequirements + rejectedRequirements;
    const complianceScore = denominator === 0 ? 0 : Number(((approvedRequirements / denominator) * 100).toFixed(1));

    return {
      approvedRequirements,
      reviewRequirements,
      rejectedRequirements,
      complianceScore,
    };
  }

  /** GET /workspace/:twinId/team */
  async getTeamSummary(projectId: string) {
    if (!projectId) {
      return {
        totalMembers: 0,
        adminMembers: 0,
        memberMembers: 0,
        viewerMembers: 0,
        recentActivityCount: 0,
      };
    }

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalMembers, adminMembers, memberMembers, viewerMembers, recentActivityCount] =
      await Promise.all([
        this.prisma.projectMember.count({ where: { projectId } }),
        this.prisma.projectMember.count({ where: { projectId, role: 'ADMIN' } }),
        this.prisma.projectMember.count({ where: { projectId, role: 'MEMBER' } }),
        this.prisma.projectMember.count({ where: { projectId, role: 'VIEWER' } }),
        this.prisma.twinActivityLog.count({
          where: {
            twin: { projectId },
            createdAt: { gte: dayAgo },
          },
        }),
      ]);

    return {
      totalMembers,
      adminMembers,
      memberMembers,
      viewerMembers,
      recentActivityCount,
    };
  }

  /** GET /workspace/:twinId/hotspots */
  getHotspots(twinId: string) {
    return this.prisma.viewportHotspot.findMany({
      where: { twinId },
      include: {
        subsystem: {
          select: { id: true, name: true, identifier: true, status: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** GET /workspace/:twinId/alerts */
  getAlerts(twinId: string) {
    return this.prisma.alertEvent.findMany({
      where: { twinId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /** GET /workspace/:twinId/history */
  getHistory(twinId: string) {
    return this.prisma.twinActivityLog.findMany({
      where: { twinId },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /** GET /workspace/:twinId/view-config */
  async getViewConfig(twinId: string) {
    const config = await this.prisma.workspaceViewConfig.findUnique({
      where: { twinId },
      include: {
        selectedMaterial: true,
        selectedLighting: true,
      },
    });
    return config;
  }

  /** PATCH /workspace/:twinId/view-config — upsert */
  async updateViewConfig(twinId: string, dto: UpdateViewConfigDto) {
    const data = {
      ...(dto.selectedMaterialId !== undefined && {
        selectedMaterialId: dto.selectedMaterialId,
      }),
      ...(dto.selectedLightingId !== undefined && {
        selectedLightingId: dto.selectedLightingId,
      }),
      ...(dto.camDof !== undefined && { camDof: dto.camDof }),
      ...(dto.camFstop !== undefined && { camFstop: dto.camFstop }),
    };

    return this.prisma.workspaceViewConfig.upsert({
      where: { twinId },
      create: { twinId, ...data },
      update: data,
      include: {
        selectedMaterial: true,
        selectedLighting: true,
      },
    });
  }
}
