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

    return {
      twin,
      project: twin?.project ?? null,
      viewConfig: twin?.viewConfig ?? null,
      alertCount,
      hotspotCount,
      activityCount,
      materialPresets,
      lightingPresets,
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
