'use client';

import React, { useState, useCallback } from 'react';
import type {
  WorkspaceSummary,
  ViewportHotspot,
  AlertEvent,
  TwinActivityLog,
  WorkspaceViewConfig,
} from '@naval/domain';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { WorkspaceTopBar } from './WorkspaceTopBar';
import { VesselViewport } from './VesselViewport';
import { InspectorPanel } from './InspectorPanel';
import { AlertsOverlay } from './AlertsOverlay';
import { HistoryOverlay } from './HistoryOverlay';
import { AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WorkspaceSection =
  | 'overview'
  | 'vessel-layout'
  | 'performance'
  | 'design-studio'
  | 'history'
  | 'rules'
  | 'team';

interface WorkspaceShellProps {
  twinId: string;
  summary: WorkspaceSummary;
  hotspots: ViewportHotspot[];
  alerts: AlertEvent[];
  history: TwinActivityLog[];
  initialViewConfig: WorkspaceViewConfig | null;
}

export function WorkspaceShell({
  twinId,
  summary,
  hotspots,
  alerts,
  history,
  initialViewConfig,
}: WorkspaceShellProps) {
  // ── Navigation state ──────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview');

  // ── Hotspot selection ─────────────────────────────────────────────────────
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const selectedHotspot = hotspots.find((h) => h.id === selectedHotspotId) ?? null;

  // ── Design studio state (synced to API) ───────────────────────────────────
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    initialViewConfig?.selectedMaterialId ?? null,
  );
  const [selectedLightingId, setSelectedLightingId] = useState<string | null>(
    initialViewConfig?.selectedLightingId ?? null,
  );
  const [camDof, setCamDof] = useState(initialViewConfig?.camDof ?? 3.0);
  const [camFstop, setCamFstop] = useState(initialViewConfig?.camFstop ?? 30.0);

  // ── Overlay visibility ────────────────────────────────────────────────────
  const [alertsOpen, setAlertsOpen] = useState(alerts.some((a) => !a.resolvedAt));
  const [historyOpen, setHistoryOpen] = useState(false);

  // ── View-config persistence ───────────────────────────────────────────────
  const persistViewConfig = useCallback(
    async (patch: {
      selectedMaterialId?: string | null;
      selectedLightingId?: string | null;
      camDof?: number;
      camFstop?: number;
    }) => {
      try {
        const apiBase =
          process.env['NEXT_PUBLIC_API_URL'] ??
          'http://localhost:4000';
        const apiToken =
          process.env['NEXT_PUBLIC_API_AUTH_TOKEN'] ??
          (process.env['NODE_ENV'] === 'production' ? undefined : 'dev-token');

        await fetch(`${apiBase}/api/v1/workspace/${twinId}/view-config`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
          },
          body: JSON.stringify(patch),
        });
      } catch {
        // Silently swallow — UI state still updates locally.
      }
    },
    [twinId],
  );

  const handleMaterialSelect = useCallback(
    (id: string) => {
      setSelectedMaterialId(id);
      void persistViewConfig({ selectedMaterialId: id });
    },
    [persistViewConfig],
  );

  const handleLightingSelect = useCallback(
    (id: string) => {
      setSelectedLightingId(id);
      void persistViewConfig({ selectedLightingId: id });
    },
    [persistViewConfig],
  );

  const handleDofChange = useCallback(
    (v: number) => {
      setCamDof(v);
      void persistViewConfig({ camDof: v });
    },
    [persistViewConfig],
  );

  const handleFstopChange = useCallback(
    (v: number) => {
      setCamFstop(v);
      void persistViewConfig({ camFstop: v });
    },
    [persistViewConfig],
  );

  // ── Active-alert count ────────────────────────────────────────────────────
  const activeAlertCount = alerts.filter((a) => !a.resolvedAt).length;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-surface-0">
      {/* ── Top status bar ─────────────────────────────────────────────── */}
      <WorkspaceTopBar
        twinName={summary.twin.name}
        projectName={summary.project?.name ?? 'Project'}
      />

      {/* ── Main row ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <WorkspaceSidebar
          twinName={summary.twin.name}
          projectName={summary.project?.name ?? 'Project'}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Center: vessel viewport */}
        <main className="flex-1 relative overflow-hidden bg-surface-0">
          {/* Section content overlay (non-viewport sections) */}
          {activeSection !== 'overview' && activeSection !== 'vessel-layout' && activeSection !== 'design-studio' ? (
            <SectionPlaceholder section={activeSection} />
          ) : (
            <VesselViewport
              hotspots={hotspots}
              selectedHotspotId={selectedHotspotId}
              onHotspotSelect={(id) => {
                setSelectedHotspotId((prev) => (prev === id ? null : id));
              }}
              className="absolute inset-0"
            />
          )}

          {/* Bottom overlay toggle buttons */}
          <div className="absolute bottom-4 left-4 flex gap-2 z-10">
            {activeAlertCount > 0 && (
              <button
                onClick={() => setAlertsOpen((v) => !v)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-2xs font-semibold transition-all',
                  alertsOpen
                    ? 'bg-naval-red/20 border-naval-red/40 text-naval-red'
                    : 'bg-surface-1/80 border-border text-text-muted hover:text-naval-red hover:border-naval-red/40 backdrop-blur-sm',
                )}
              >
                <AlertTriangle size={11} />
                {activeAlertCount} Alert{activeAlertCount !== 1 ? 's' : ''}
              </button>
            )}
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-2xs font-semibold transition-all',
                historyOpen
                  ? 'bg-naval-cyan/10 border-naval-cyan/30 text-naval-cyan'
                  : 'bg-surface-1/80 border-border text-text-muted hover:text-naval-cyan hover:border-naval-cyan/30 backdrop-blur-sm',
              )}
            >
              <Clock size={11} />
              History
            </button>
          </div>

          {/* Overlays */}
          {alertsOpen && activeAlertCount > 0 && (
            <AlertsOverlay alerts={alerts} onClose={() => setAlertsOpen(false)} />
          )}
          {historyOpen && (
            <HistoryOverlay entries={history} onClose={() => setHistoryOpen(false)} />
          )}
        </main>

        {/* Right inspector */}
        <InspectorPanel
          viewConfig={initialViewConfig}
          materialPresets={summary.materialPresets}
          lightingPresets={summary.lightingPresets}
          selectedHotspot={selectedHotspot}
          selectedMaterialId={selectedMaterialId}
          selectedLightingId={selectedLightingId}
          camDof={camDof}
          camFstop={camFstop}
          onMaterialSelect={handleMaterialSelect}
          onLightingSelect={handleLightingSelect}
          onDofChange={handleDofChange}
          onFstopChange={handleFstopChange}
        />
      </div>
    </div>
  );
}

function SectionPlaceholder({ section }: { section: WorkspaceSection }) {
  const labels: Record<WorkspaceSection, string> = {
    overview: 'Overview',
    'vessel-layout': 'Vessel Layout',
    performance: 'Performance Tests',
    'design-studio': 'Design Studio',
    history: 'History Log',
    rules: 'Rules Check',
    team: 'Team Hub',
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-text-muted">
      <div className="h-px w-24 bg-border" />
      <p className="text-sm font-medium text-text-secondary">{labels[section]}</p>
      <p className="text-2xs text-text-dim">This section is under development</p>
      <div className="h-px w-24 bg-border" />
    </div>
  );
}
