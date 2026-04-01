'use client';

import { X } from 'lucide-react';
import type { WorkspaceViewConfig, MaterialPreset, LightingPreset, ViewportHotspot } from '@naval/domain';
import { MaterialsSection } from './MaterialsSection';
import { LightingSection } from './LightingSection';
import { CameraSection } from './CameraSection';
import { KeyframeSection } from './KeyframeSection';
import { cn } from '@/lib/utils';

interface InspectorPanelProps {
  viewConfig: WorkspaceViewConfig | null;
  materialPresets: MaterialPreset[];
  lightingPresets: LightingPreset[];
  selectedHotspot: ViewportHotspot | null;
  selectedMaterialId: string | null;
  selectedLightingId: string | null;
  camDof: number;
  camFstop: number;
  onMaterialSelect: (id: string) => void;
  onLightingSelect: (id: string) => void;
  onDofChange: (v: number) => void;
  onFstopChange: (v: number) => void;
}

export function InspectorPanel({
  materialPresets,
  lightingPresets,
  selectedHotspot,
  selectedMaterialId,
  selectedLightingId,
  camDof,
  camFstop,
  onMaterialSelect,
  onLightingSelect,
  onDofChange,
  onFstopChange,
}: InspectorPanelProps) {
  return (
    <aside className="w-52 shrink-0 flex flex-col bg-surface-1 border-l border-border-subtle overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-border-subtle shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xs font-bold text-text-primary tracking-wide uppercase">
              Design Studio
            </h2>
            <p className="text-2xs text-text-dim leading-tight mt-0.5">
              Cinematic execution and optimisation.
            </p>
          </div>
        </div>
      </div>

      {/* Selected hotspot callout */}
      {selectedHotspot && (
        <div className="mx-2 mt-2 rounded border border-naval-cyan/20 bg-naval-cyan/5 px-2.5 py-2 shrink-0">
          <div className="text-2xs font-mono text-naval-cyan mb-0.5">
            {selectedHotspot.subsystem?.identifier ?? 'HOTSPOT'}
          </div>
          <div className="text-2xs font-semibold text-text-primary">{selectedHotspot.label}</div>
          {selectedHotspot.description && (
            <div className="text-2xs text-text-muted mt-0.5 leading-tight line-clamp-2">
              {selectedHotspot.description}
            </div>
          )}
          {selectedHotspot.subsystem && (
            <div className="flex items-center gap-1 mt-1.5">
              <span
                className={cn(
                  'text-2xs px-1 py-0.5 rounded border',
                  selectedHotspot.subsystem.status === 'VERIFIED'
                    ? 'bg-naval-teal/10 border-naval-teal/30 text-naval-teal'
                    : selectedHotspot.subsystem.status === 'DEFINED'
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-surface-3 border-border text-text-muted',
                )}
              >
                {selectedHotspot.subsystem.status}
              </span>
              <span className="text-2xs text-text-dim truncate">
                {selectedHotspot.subsystem.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto">
        <MaterialsSection
          presets={materialPresets}
          selectedId={selectedMaterialId}
          onSelect={onMaterialSelect}
        />
        <LightingSection
          presets={lightingPresets}
          selectedId={selectedLightingId}
          onSelect={onLightingSelect}
        />
        <CameraSection
          dof={camDof}
          fstop={camFstop}
          onDofChange={onDofChange}
          onFstopChange={onFstopChange}
        />
        <KeyframeSection />
      </div>
    </aside>
  );
}
