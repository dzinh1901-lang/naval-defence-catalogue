import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { IntelligenceService } from '../intelligence/intelligence.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateViewConfigDto } from './dto/update-view-config.dto';
import { WorkspaceAgentCollaborateDto } from './dto/workspace-agent-collaborate.dto';

type CameraState = {
  yaw: number;
  pitch: number;
  zoom: number;
  fieldOfView: number;
};

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly intelligence: IntelligenceService,
  ) {}

  async getSummary(twinId: string, organizationId: string) {
    const twin = await this.loadWorkspaceContext(twinId, organizationId);
    if (!twin) {
      return null;
    }

    const [performance, rules, team, hotspotCount, alertCount] = await Promise.all([
      this.buildPerformanceSummary(twinId),
      this.buildRulesSummary(twin.projectId),
      this.buildTeamSummary(twin.projectId, twinId),
      this.prisma.viewportHotspot.count({ where: { twinId } }),
      this.prisma.alertEvent.count({ where: { twinId, acknowledged: false } }),
    ]);

    return {
      twin: {
        id: twin.id,
        name: twin.name,
        description: twin.description,
        version: twin.version,
        status: twin.status,
        hullCode: twin.hullCode,
        className: twin.className,
        runtimeStatus: twin.runtimeStatus,
        syncStatus: twin.syncStatus,
        lastSyncedAt: twin.lastSyncedAt,
        locationLabel: twin.locationLabel,
        missionProfile: twin.missionProfile,
        projectId: twin.projectId,
        createdAt: twin.createdAt,
        updatedAt: twin.updatedAt,
      },
      project: {
        id: twin.project.id,
        name: twin.project.name,
        slug: twin.project.slug,
        status: twin.project.status,
        organizationId: twin.project.organizationId,
      },
      organization: {
        id: twin.project.organization.id,
        name: twin.project.organization.name,
        slug: twin.project.organization.slug,
        plan: twin.project.organization.plan,
      },
      subsystemTree: twin.subsystems,
      hotspotCount,
      alertCount,
      performance,
      rules,
      team,
    };
  }

  async getAlerts(twinId: string, organizationId: string) {
    await this.ensureTwinAccess(twinId, organizationId);

    const alerts = await this.prisma.alertEvent.findMany({
      where: { twinId },
      include: {
        subsystem: {
          select: { id: true, name: true, identifier: true, status: true },
        },
      },
      orderBy: { raisedAt: 'desc' },
    });

    const weight: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    return alerts.sort((left, right) => {
      const severityDelta = (weight[left.severity] ?? 9) - (weight[right.severity] ?? 9);
      if (severityDelta !== 0) {
        return severityDelta;
      }

      return right.raisedAt.getTime() - left.raisedAt.getTime();
    });
  }

  async getHistory(twinId: string, organizationId: string) {
    await this.ensureTwinAccess(twinId, organizationId);

    const logs = await this.prisma.twinActivityLog.findMany({
      where: { twinId },
      include: {
        actor: {
          select: { id: true, name: true, title: true },
        },
        subsystem: {
          select: { id: true, name: true },
        },
      },
      orderBy: { occurredAt: 'desc' },
      take: 12,
    });

    return logs.map((log) => ({
      ...log,
      actorName: log.actor?.name ?? null,
      actorTitle: log.actor?.title ?? null,
      subsystemName: log.subsystem?.name ?? null,
    }));
  }

  async getHotspots(twinId: string, organizationId: string) {
    await this.ensureTwinAccess(twinId, organizationId);

    return this.prisma.viewportHotspot.findMany({
      where: { twinId },
      include: {
        subsystem: {
          select: { id: true, name: true, identifier: true, status: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getViewConfig(twinId: string, organizationId: string) {
    await this.ensureTwinAccess(twinId, organizationId);
    return this.buildViewConfigPayload(twinId);
  }

  async updateViewConfig(twinId: string, organizationId: string, dto: UpdateViewConfigDto) {
    await this.ensureTwinAccess(twinId, organizationId);

    const current = await this.ensureViewConfig(twinId);
    const nextState: Prisma.WorkspaceViewConfigUncheckedUpdateInput = {};

    if (dto.selectedHotspotId !== undefined) {
      if (dto.selectedHotspotId) {
        await this.assertHotspotBelongsToTwin(twinId, dto.selectedHotspotId);
      }
      nextState.selectedHotspotId = dto.selectedHotspotId ?? null;
    }

    if (dto.selectedMaterialPresetId !== undefined) {
      if (dto.selectedMaterialPresetId) {
        await this.assertMaterialPresetBelongsToTwin(twinId, dto.selectedMaterialPresetId);
      }
      nextState.selectedMaterialPresetId = dto.selectedMaterialPresetId ?? null;
    }

    if (dto.selectedLightingPresetId !== undefined) {
      if (dto.selectedLightingPresetId) {
        await this.assertLightingPresetBelongsToTwin(twinId, dto.selectedLightingPresetId);
      }
      nextState.selectedLightingPresetId = dto.selectedLightingPresetId ?? null;
    }

    let cameraPresetState: CameraState | undefined;
    if (dto.selectedCameraPresetId !== undefined) {
      if (dto.selectedCameraPresetId) {
        const preset = await this.assertCameraPresetBelongsToTwin(twinId, dto.selectedCameraPresetId);
        cameraPresetState = this.cameraStateFromPreset(preset);
      }
      nextState.selectedCameraPresetId = dto.selectedCameraPresetId ?? null;
    }

    if (dto.activeKeyframeSequenceId !== undefined) {
      if (dto.activeKeyframeSequenceId) {
        await this.assertKeyframeBelongsToTwin(twinId, dto.activeKeyframeSequenceId);
      }
      nextState.activeKeyframeSequenceId = dto.activeKeyframeSequenceId ?? null;
    }

    if (dto.activeSection !== undefined) {
      nextState.activeSection = dto.activeSection;
    }

    if (dto.cameraState !== undefined || cameraPresetState) {
      nextState.cameraState = this.mergeCameraState(current.cameraState, dto.cameraState, cameraPresetState);
    }

    await this.prisma.workspaceViewConfig.update({
      where: { twinId },
      data: nextState,
    });

    return this.buildViewConfigPayload(twinId);
  }

  async getPerformance(twinId: string, organizationId: string) {
    await this.ensureTwinAccess(twinId, organizationId);
    return this.buildPerformanceSummary(twinId);
  }

  async getRules(twinId: string, organizationId: string) {
    const twin = await this.ensureTwinAccess(twinId, organizationId);
    return this.buildRulesSummary(twin.projectId);
  }

  async getTeam(twinId: string, organizationId: string) {
    const twin = await this.ensureTwinAccess(twinId, organizationId);
    return this.buildTeamSummary(twin.projectId, twinId);
  }

  async getDashboard(twinId: string, organizationId: string) {
    const summary = await this.getSummary(twinId, organizationId);
    if (!summary) {
      throw new NotFoundException(`Workspace twin ${twinId} not found`);
    }

    const [hotspots, alerts, viewConfig, completedRuns] = await Promise.all([
      this.getHotspots(twinId, organizationId),
      this.getAlerts(twinId, organizationId),
      this.getViewConfig(twinId, organizationId),
      this.prisma.simulationRun.findMany({
        where: {
          status: 'COMPLETED',
          simulation: { twinId },
        },
        select: {
          id: true,
          completedAt: true,
          result: true,
        },
        orderBy: { completedAt: 'desc' },
        take: 12,
      }),
    ]);

    const openAlertCountBySubsystem = new Map<string, number>();
    for (const alert of alerts) {
      if (alert.subsystemId && !alert.acknowledged) {
        openAlertCountBySubsystem.set(
          alert.subsystemId,
          (openAlertCountBySubsystem.get(alert.subsystemId) ?? 0) + 1,
        );
      }
    }

    const trendRuns = completedRuns.slice().reverse();
    const trends =
      trendRuns.length > 0
        ? trendRuns.map((run, index) => {
            const result = (run.result ?? {}) as Record<string, number>;
            return {
              id: run.id,
              label: run.completedAt
                ? run.completedAt.toISOString().slice(11, 16)
                : `Run ${index + 1}`,
              timestamp: run.completedAt?.toISOString() ?? null,
              readinessScore: this.pickNumber(
                result['readinessScore'],
                summary.performance.readinessScore,
              ),
              combatLatencyMs: this.pickNumber(
                result['combatLatencyMs'],
                summary.performance.combatLatencyMs,
              ),
              hullStressMarginPct: this.pickNumber(
                result['hullStressMarginPct'],
                summary.performance.hullStressMarginPct,
              ),
            };
          })
        : this.buildSyntheticTrendSeries(summary.performance);

    const breakdown = hotspots.map((hotspot) => ({
      hotspotId: hotspot.id,
      subsystemName: hotspot.subsystem?.name ?? 'Unassigned subsystem',
      subsystemIdentifier: hotspot.subsystem?.identifier ?? 'N/A',
      category: hotspot.category,
      hotspotStatus: hotspot.status,
      healthScore: hotspot.healthScore,
      openAlerts: hotspot.subsystemId
        ? (openAlertCountBySubsystem.get(hotspot.subsystemId) ?? 0)
        : 0,
      telemetry: hotspot.telemetry,
    }));

    const readyHotspots = breakdown.filter((entry) => entry.healthScore >= 85).length;

    return {
      summary,
      performance: summary.performance,
      rules: summary.rules,
      team: summary.team,
      viewConfig,
      hotspots,
      kpis: [
        {
          id: 'readiness',
          label: 'Readiness',
          value: summary.performance.readinessScore,
          unit: '%',
          trend: summary.performance.readinessScore >= 85 ? 'up' : 'steady',
          deltaText: `Latest ${summary.performance.latestRunLabel}`,
        },
        {
          id: 'rules',
          label: 'Compliance',
          value: summary.rules.complianceScore,
          unit: '%',
          trend: summary.rules.complianceScore >= 90 ? 'up' : 'steady',
          deltaText: `${summary.rules.openReviews} open reviews`,
        },
        {
          id: 'hotspots',
          label: 'Render Hotspots',
          value: readyHotspots,
          unit: `/${breakdown.length}`,
          trend: readyHotspots >= Math.ceil(Math.max(1, breakdown.length) * 0.8) ? 'up' : 'steady',
          deltaText: `${summary.hotspotCount} total tracked`,
        },
        {
          id: 'agent',
          label: 'MCP-ADK Agent',
          value: 'Online',
          trend: 'up',
          deltaText: 'Context-aware design collaboration',
        },
      ],
      trends,
      breakdown,
      agent: {
        name: 'MCP-ADK Co-Design Agent',
        status: 'online',
        modelLabel: 'Naval Intelligence RAG',
        endpointPath: `/api/v1/workspace/${twinId}/agent/collaborate`,
        capabilities: [
          'Subsystem-aware design prompts',
          'Variant and evidence retrieval',
          'Render pipeline guidance',
        ],
      },
      assumptions: [
        'Trend series uses recent completed simulation runs when available.',
        'If no completed run exists yet, synthetic baseline trends are shown.',
        'Hotspot health is used as a render-readiness proxy until GPU telemetry is integrated.',
      ],
    };
  }

  async collaborateWithAgent(
    twinId: string,
    organizationId: string,
    dto: WorkspaceAgentCollaborateDto,
  ) {
    const summary = await this.getSummary(twinId, organizationId);
    if (!summary) {
      throw new NotFoundException(`Workspace twin ${twinId} not found`);
    }

    const query = dto.query.trim();
    const references = await this.intelligence.ragQuery({
      query,
      topK: dto.topK ?? 6,
      twinId,
      projectId: summary.project.id,
    });

    const recommendations =
      references.length > 0
        ? references.map((reference, index) => {
            return `${index + 1}. ${
              reference.kind === 'subsystem'
                ? 'Refine subsystem'
                : reference.kind === 'variant'
                  ? 'Compare variant'
                  : 'Validate evidence'
            } using "${reference.title}" (${Math.round(reference.score * 100)}% relevance).`;
          })
        : [
            'No direct design context matched the prompt. Try naming a subsystem, variant, or review artifact.',
            'For render tuning, include desired camera intent (e.g., hull stress, sonar arc, propulsion wake).',
          ];

    return {
      prompt: query,
      generatedAt: new Date().toISOString(),
      summary: `Agent synced with twin ${summary.twin.name}. Readiness ${summary.performance.readinessScore}%, compliance ${summary.rules.complianceScore}%.`,
      recommendations,
      references: references.map((reference) => ({
        kind: reference.kind,
        id: reference.id,
        title: reference.title,
        score: reference.score,
      })),
    };
  }

  private async ensureTwinAccess(twinId: string, organizationId: string) {
    const twin = await this.prisma.digitalTwin.findFirst({
      where: {
        id: twinId,
        project: { organizationId },
      },
      select: { id: true, projectId: true },
    });

    if (!twin) {
      throw new NotFoundException(`Workspace twin ${twinId} not found`);
    }

    return twin;
  }

  private async loadWorkspaceContext(twinId: string, organizationId: string) {
    return this.prisma.digitalTwin.findFirst({
      where: {
        id: twinId,
        project: { organizationId },
      },
      include: {
        project: {
          include: {
            organization: {
              select: { id: true, name: true, slug: true, plan: true },
            },
          },
        },
        subsystems: {
          where: { parentId: null },
          include: {
            interfaces: true,
            children: {
              include: {
                interfaces: true,
                children: {
                  include: { interfaces: true },
                  orderBy: { name: 'asc' },
                },
              },
              orderBy: { name: 'asc' },
            },
          },
          orderBy: [{ depth: 'asc' }, { name: 'asc' }],
        },
      },
    });
  }

  private async buildViewConfigPayload(twinId: string) {
    const config = await this.ensureViewConfig(twinId);

    const [materials, lightingPresets, cameraPresets, keyframeSequences] = await Promise.all([
      this.prisma.materialPreset.findMany({
        where: { twinId },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.lightingPreset.findMany({
        where: { twinId },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.cameraPreset.findMany({
        where: { twinId },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      }),
      this.prisma.keyframeSequence.findMany({
        where: { twinId },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      }),
    ]);

    return {
      config: {
        ...config,
        cameraState: this.mergeCameraState(config.cameraState),
      },
      materials,
      lightingPresets,
      cameraPresets,
      keyframeSequences,
    };
  }

  private async ensureViewConfig(twinId: string) {
    const existing = await this.prisma.workspaceViewConfig.findUnique({
      where: { twinId },
    });

    if (existing) {
      return existing;
    }

    const [defaultHotspot, defaultMaterial, defaultLighting, defaultCamera, defaultKeyframe] =
      await Promise.all([
        this.prisma.viewportHotspot.findFirst({
          where: { twinId },
          orderBy: { displayOrder: 'asc' },
        }),
        this.prisma.materialPreset.findFirst({
          where: { twinId, isDefault: true },
          orderBy: { name: 'asc' },
        }),
        this.prisma.lightingPreset.findFirst({
          where: { twinId, isDefault: true },
          orderBy: { name: 'asc' },
        }),
        this.prisma.cameraPreset.findFirst({
          where: { twinId, isDefault: true },
          orderBy: { name: 'asc' },
        }),
        this.prisma.keyframeSequence.findFirst({
          where: { twinId, isDefault: true },
          orderBy: { name: 'asc' },
        }),
      ]);

    return this.prisma.workspaceViewConfig.create({
      data: {
        twinId,
        selectedHotspotId: defaultHotspot?.id ?? null,
        selectedMaterialPresetId: defaultMaterial?.id ?? null,
        selectedLightingPresetId: defaultLighting?.id ?? null,
        selectedCameraPresetId: defaultCamera?.id ?? null,
        activeKeyframeSequenceId: defaultKeyframe?.id ?? null,
        activeSection: 'overview',
        cameraState: this.cameraStateFromPreset(defaultCamera),
      },
    });
  }

  private async buildPerformanceSummary(twinId: string) {
    const latestRun = await this.prisma.simulationRun.findFirst({
      where: {
        status: 'COMPLETED',
        simulation: { twinId },
      },
      orderBy: { completedAt: 'desc' },
    });

    const result = (latestRun?.result ?? {}) as Record<string, number>;

    return {
      readinessScore: this.pickNumber(result['readinessScore'], 88),
      latestRunLabel: latestRun?.completedAt
        ? this.formatTimestamp(latestRun.completedAt)
        : 'No completed run',
      maxSpeedKnots: this.pickNumber(result['maxSpeed'], 30.4),
      enduranceNm: this.pickNumber(result['endurance16kt'], 7050),
      acousticMarginDb: this.pickNumber(result['acousticMarginDb'], 6.4),
      hullStressMarginPct: this.pickNumber(result['hullStressMarginPct'], 15),
      combatLatencyMs: this.pickNumber(result['combatLatencyMs'], 680),
    };
  }

  private async buildRulesSummary(projectId: string) {
    const [approvedRequirements, reviewRequirements, draftRequirements, openReviews, criticalRule] =
      await Promise.all([
        this.prisma.requirement.count({ where: { projectId, status: 'APPROVED' } }),
        this.prisma.requirement.count({ where: { projectId, status: 'REVIEW' } }),
        this.prisma.requirement.count({ where: { projectId, status: 'DRAFT' } }),
        this.prisma.review.count({
          where: { projectId, status: { in: ['OPEN', 'IN_REVIEW'] } },
        }),
        this.prisma.requirement.findFirst({
          where: {
            projectId,
            priority: 'MUST',
            status: { not: 'APPROVED' },
          },
          orderBy: { identifier: 'asc' },
        }),
      ]);

    const totalTracked = approvedRequirements + reviewRequirements + draftRequirements;
    const complianceScore = totalTracked
      ? Math.max(
          55,
          Math.min(
            99,
            Math.round(
              (approvedRequirements / totalTracked) * 100 -
                reviewRequirements * 4 -
                draftRequirements * 3 -
                openReviews * 5,
            ),
          ),
        )
      : 100;

    return {
      complianceScore,
      approvedRequirements,
      reviewRequirements,
      draftRequirements,
      openReviews,
      criticalRule:
        criticalRule?.identifier && criticalRule?.text
          ? `${criticalRule.identifier}: ${criticalRule.text}`
          : 'No blocking rule findings',
    };
  }

  private async buildTeamSummary(projectId: string, twinId: string) {
    const [members, activity, review] = await Promise.all([
      this.prisma.projectMember.findMany({
        where: { projectId },
        include: {
          user: {
            select: { id: true, name: true, title: true },
          },
        },
        orderBy: { role: 'desc' },
      }),
      this.prisma.twinActivityLog.findMany({
        where: {
          twinId,
          actorId: { not: null },
        },
        orderBy: { occurredAt: 'desc' },
        take: 25,
      }),
      this.prisma.review.findFirst({
        where: { projectId, status: { in: ['OPEN', 'IN_REVIEW'] } },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const latestByActor = new Map<string, Date>();
    for (const entry of activity) {
      if (entry.actorId && !latestByActor.has(entry.actorId)) {
        latestByActor.set(entry.actorId, entry.occurredAt);
      }
    }

    const now = Date.now();
    const mappedMembers = members.map((member) => {
      const lastActiveAt = latestByActor.get(member.userId) ?? null;
      const hoursSinceActive = lastActiveAt
        ? (now - lastActiveAt.getTime()) / 3_600_000
        : Number.POSITIVE_INFINITY;

      const status =
        hoursSinceActive <= 4
          ? 'online'
          : hoursSinceActive <= 12
            ? 'reviewing'
            : 'offline';

      return {
        id: member.userId,
        name: member.user.name,
        title: member.user.title,
        role: member.role,
        status,
        lastActiveAt: lastActiveAt?.toISOString() ?? null,
      };
    });

    return {
      activeMembers: mappedMembers.length,
      onlineMembers: mappedMembers.filter((member) => member.status !== 'offline').length,
      upcomingReview: review
        ? `${review.title} (${review.status})`
        : 'No review currently queued',
      members: mappedMembers,
    };
  }

  private buildSyntheticTrendSeries(performance: {
    readinessScore: number;
    combatLatencyMs: number;
    hullStressMarginPct: number;
  }) {
    const offsets = [-4, -2, -1, 0, 1, 2];

    return offsets.map((offset, index) => ({
      id: `synthetic-${index + 1}`,
      label: `T-${offsets.length - index}`,
      timestamp: null,
      readinessScore: Math.max(0, Math.min(100, performance.readinessScore + offset)),
      combatLatencyMs: Math.max(100, performance.combatLatencyMs - offset * 11),
      hullStressMarginPct: Math.max(1, performance.hullStressMarginPct + offset * 0.5),
    }));
  }

  private async assertHotspotBelongsToTwin(twinId: string, hotspotId: string) {
    const count = await this.prisma.viewportHotspot.count({
      where: { id: hotspotId, twinId },
    });

    if (!count) {
      throw new BadRequestException(`Hotspot ${hotspotId} does not belong to twin ${twinId}`);
    }
  }

  private async assertMaterialPresetBelongsToTwin(twinId: string, presetId: string) {
    const count = await this.prisma.materialPreset.count({
      where: { id: presetId, twinId },
    });

    if (!count) {
      throw new BadRequestException(`Material preset ${presetId} does not belong to twin ${twinId}`);
    }
  }

  private async assertLightingPresetBelongsToTwin(twinId: string, presetId: string) {
    const count = await this.prisma.lightingPreset.count({
      where: { id: presetId, twinId },
    });

    if (!count) {
      throw new BadRequestException(`Lighting preset ${presetId} does not belong to twin ${twinId}`);
    }
  }

  private async assertCameraPresetBelongsToTwin(twinId: string, presetId: string) {
    const preset = await this.prisma.cameraPreset.findFirst({
      where: { id: presetId, twinId },
    });

    if (!preset) {
      throw new BadRequestException(`Camera preset ${presetId} does not belong to twin ${twinId}`);
    }

    return preset;
  }

  private async assertKeyframeBelongsToTwin(twinId: string, keyframeId: string) {
    const count = await this.prisma.keyframeSequence.count({
      where: { id: keyframeId, twinId },
    });

    if (!count) {
      throw new BadRequestException(`Keyframe ${keyframeId} does not belong to twin ${twinId}`);
    }
  }

  private cameraStateFromPreset(
    preset?:
      | {
          yaw: number;
          pitch: number;
          zoom: number;
          fieldOfView: number;
        }
      | null,
  ): CameraState {
    return {
      yaw: preset?.yaw ?? 12,
      pitch: preset?.pitch ?? -7,
      zoom: preset?.zoom ?? 1.03,
      fieldOfView: preset?.fieldOfView ?? 34,
    };
  }

  private mergeCameraState(
    current: unknown,
    patch?: Partial<CameraState>,
    presetState?: CameraState,
  ): CameraState {
    const base = this.normalizeCameraState(current);
    return {
      ...base,
      ...(presetState ?? {}),
      ...(patch ?? {}),
    };
  }

  private normalizeCameraState(value: unknown): CameraState {
    if (!value || typeof value !== 'object') {
      return this.cameraStateFromPreset();
    }

    const input = value as Partial<CameraState>;
    return {
      yaw: typeof input.yaw === 'number' ? input.yaw : 12,
      pitch: typeof input.pitch === 'number' ? input.pitch : -7,
      zoom: typeof input.zoom === 'number' ? input.zoom : 1.03,
      fieldOfView: typeof input.fieldOfView === 'number' ? input.fieldOfView : 34,
    };
  }

  private pickNumber(value: number | undefined, fallback: number) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  private formatTimestamp(value: Date) {
    return `${value.toISOString().slice(0, 16).replace('T', ' ')}Z`;
  }
}
