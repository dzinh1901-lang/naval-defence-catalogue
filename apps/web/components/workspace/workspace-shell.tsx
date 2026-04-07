'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CameraPreset,
  ViewportHotspot,
  WorkspaceViewConfigPayload,
  WorkspaceViewConfigUpdateInput,
} from '@naval/domain';
import { AlertsOverlay } from './alerts-overlay';
import { HistoryOverlay } from './history-overlay';
import { InspectorPanel } from './inspector-panel';
import { VesselViewport } from './vessel-viewport';
import { WorkspaceSidebar } from './workspace-sidebar';
import { WorkspaceTopBar } from './workspace-top-bar';
import {
  WORKSPACE_NAV_ITEMS,
  type WorkspaceRouteData,
  type WorkspaceSaveState,
  type WorkspaceStudioState,
} from './workspace-types';

interface WorkspaceShellProps {
  data: WorkspaceRouteData;
}

export function WorkspaceShell({ data }: WorkspaceShellProps) {
  const [studioState, setStudioState] = useState<WorkspaceStudioState>(() =>
    toStudioState(data.viewConfig, data.hotspots),
  );
  const [saveState, setSaveState] = useState<WorkspaceSaveState>('idle');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasMounted = useRef(false);
  const saveResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedHotspot = useMemo(
    () =>
      data.hotspots.find((hotspot) => hotspot.id === studioState.selectedHotspotId) ??
      data.hotspots[0] ??
      null,
    [data.hotspots, studioState.selectedHotspotId],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const timer = setTimeout(() => {
      void persistConfig({ cameraState: studioState.cameraState });
    }, 420);

    return () => clearTimeout(timer);
  }, [studioState.cameraState]);

  function markSaved(next: WorkspaceViewConfigPayload) {
    setStudioState((current) => ({
      ...current,
      ...toStudioState(next, data.hotspots),
      selectedHotspotId: current.selectedHotspotId,
    }));
    setSaveState('saved');

    if (saveResetTimer.current) {
      clearTimeout(saveResetTimer.current);
    }

    saveResetTimer.current = setTimeout(() => {
      setSaveState('idle');
    }, 1400);
  }

  async function persistConfig(patch: WorkspaceViewConfigUpdateInput) {
    setSaveState('saving');

    try {
      const response = await fetch(`/api/workspace/${data.summary.twin.id}/view-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as WorkspaceViewConfigPayload;
      markSaved(payload);
    } catch {
      setSaveState('error');
    }
  }

  function updateStudioState(next: Partial<WorkspaceStudioState>) {
    setStudioState((current) => ({ ...current, ...next }));
  }

  function handleSectionSelect(sectionId: WorkspaceStudioState['activeSection']) {
    updateStudioState({ activeSection: sectionId });
    setSidebarOpen(false);
    void persistConfig({ activeSection: sectionId });
  }

  function handleHotspotSelect(hotspotId: string) {
    updateStudioState({ selectedHotspotId: hotspotId });
    void persistConfig({ selectedHotspotId: hotspotId });
  }

  function handleMaterialSelect(presetId: string) {
    updateStudioState({ selectedMaterialPresetId: presetId });
    void persistConfig({ selectedMaterialPresetId: presetId });
  }

  function handleLightingSelect(presetId: string) {
    updateStudioState({ selectedLightingPresetId: presetId });
    void persistConfig({ selectedLightingPresetId: presetId });
  }

  function handleCameraPresetSelect(presetId: string) {
    const preset = data.viewConfig.cameraPresets.find((item) => item.id === presetId);
    updateStudioState({
      selectedCameraPresetId: presetId,
      cameraState: preset ? toCameraState(preset) : studioState.cameraState,
    });
    void persistConfig({ selectedCameraPresetId: presetId });
  }

  function handleKeyframeSelect(sequenceId: string) {
    updateStudioState({ activeKeyframeSequenceId: sequenceId });
    void persistConfig({ activeKeyframeSequenceId: sequenceId });
  }

  return (
    <div className="h-screen overflow-y-auto bg-[linear-gradient(180deg,#02070f_0%,#07111d_50%,#02070f_100%)] text-white">
      <div className="mx-auto flex min-h-full w-full max-w-[1880px] gap-4 p-4 md:p-5 xl:p-6">
        <div className="hidden xl:block xl:w-[300px] xl:shrink-0">
          <WorkspaceSidebar
            summary={data.summary}
            items={WORKSPACE_NAV_ITEMS}
            activeSection={studioState.activeSection}
            onSelect={handleSectionSelect}
            className="sticky top-6"
          />
        </div>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-50 bg-slate-950/70 p-4 backdrop-blur-sm xl:hidden">
            <button
              type="button"
              className="absolute inset-0"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close workspace navigation"
            />
            <div className="relative mx-auto max-w-sm">
              <WorkspaceSidebar
                summary={data.summary}
                items={WORKSPACE_NAV_ITEMS}
                activeSection={studioState.activeSection}
                onSelect={handleSectionSelect}
              />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <WorkspaceTopBar
            summary={data.summary}
            saveState={saveState}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-4">
              <VesselViewport
                summary={data.summary}
                performance={data.performance}
                rules={data.rules}
                hotspots={data.hotspots}
                selectedHotspotId={studioState.selectedHotspotId}
                activeSection={studioState.activeSection}
                onSelectHotspot={handleHotspotSelect}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <AlertsOverlay alerts={data.alerts} />
                <HistoryOverlay history={data.history} />
              </div>
            </div>

            <div className="min-w-0">
              <InspectorPanel
                summary={data.summary}
                selectedHotspot={selectedHotspot}
                activeSection={studioState.activeSection}
                studioOptions={data.viewConfig}
                studioState={studioState}
                performance={data.performance}
                rules={data.rules}
                team={data.team}
                onSelectMaterial={handleMaterialSelect}
                onSelectLighting={handleLightingSelect}
                onSelectCameraPreset={handleCameraPresetSelect}
                onSelectKeyframe={handleKeyframeSelect}
                onCameraStateChange={(cameraState) => updateStudioState({ cameraState })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function toStudioState(
  payload: WorkspaceViewConfigPayload,
  hotspots: ViewportHotspot[],
): WorkspaceStudioState {
  const defaultHotspotId = payload.config.selectedHotspotId ?? hotspots[0]?.id ?? null;

  return {
    activeSection: payload.config.activeSection,
    selectedHotspotId: defaultHotspotId,
    selectedMaterialPresetId: payload.config.selectedMaterialPresetId ?? payload.materials[0]?.id ?? null,
    selectedLightingPresetId:
      payload.config.selectedLightingPresetId ?? payload.lightingPresets[0]?.id ?? null,
    selectedCameraPresetId:
      payload.config.selectedCameraPresetId ?? payload.cameraPresets[0]?.id ?? null,
    activeKeyframeSequenceId:
      payload.config.activeKeyframeSequenceId ?? payload.keyframeSequences[0]?.id ?? null,
    cameraState: {
      yaw: payload.config.cameraState.yaw,
      pitch: payload.config.cameraState.pitch,
      zoom: payload.config.cameraState.zoom,
      fieldOfView: payload.config.cameraState.fieldOfView ?? 34,
    },
  };
}

function toCameraState(preset: CameraPreset) {
  return {
    yaw: preset.yaw,
    pitch: preset.pitch,
    zoom: preset.zoom,
    fieldOfView: preset.fieldOfView,
  };
}
