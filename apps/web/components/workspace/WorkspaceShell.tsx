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
import { AlertTriangle, Clock, PanelLeftOpen, SlidersHorizontal } from 'lucide-react';
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

export function WorkspaceShell({ twinId, summary, hotspots, alerts, history, initialViewConfig }: WorkspaceShellProps) {
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const selectedHotspot = hotspots.find((h) => h.id === selectedHotspotId) ?? null;
  const [selectedMaterialPresetId, setSelectedMaterialId] = useState<string | null>(initialViewConfig?.selectedMaterialPresetId ?? null);
  const [selectedLightingPresetId, setSelectedLightingId] = useState<string | null>(initialViewConfig?.selectedLightingPresetId ?? null);
  const [alertsOpen, setAlertsOpen] = useState(alerts.some((a) => !a.resolvedAt));
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  const persistViewConfig = useCallback(
    async (patch: {
      selectedMaterialPresetId?: string | null;
      selectedLightingPresetId?: string | null;
    }) => {
      try {
        const response = await fetch(`/api/workspace/${twinId}/view-config`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
        if (!response.ok) {
          setPersistenceError('Workspace updates could not be saved right now.');
          return;
        }
        setPersistenceError(null);
      } catch {
        setPersistenceError('Workspace updates could not be saved right now.');
      }
    },
    [twinId],
  );

  const handleMaterialSelect = useCallback((id: string) => {
    setSelectedMaterialId(id);
    void persistViewConfig({ selectedMaterialPresetId: id });
  }, [persistViewConfig]);
  const handleLightingSelect = useCallback((id: string) => {
    setSelectedLightingId(id);
    void persistViewConfig({ selectedLightingPresetId: id });
  }, [persistViewConfig]);
  const handleDofChange = useCallback((_v: number) => {
    // Camera DOF not supported in current domain model
  }, []);
  const handleFstopChange = useCallback((_v: number) => {
    // Camera F-stop not supported in current domain model
  }, []);

  const activeAlertCount = alerts.filter((a) => !a.resolvedAt).length;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-surface-0">
      <WorkspaceTopBar twinName={summary.twin.name} projectName={summary.project?.name ?? 'Project'} />
      <div className="lg:hidden flex items-center gap-2 px-3 py-2 border-b border-border-subtle bg-surface-1">
        <button onClick={() => setShowSidebar(true)} className="px-2.5 py-1.5 rounded border border-border-subtle text-text-secondary text-xs flex items-center gap-1.5"><PanelLeftOpen size={13}/>Nav</button>
        <button onClick={() => setShowInspector(true)} className="px-2.5 py-1.5 rounded border border-border-subtle text-text-secondary text-xs flex items-center gap-1.5"><SlidersHorizontal size={13}/>Inspector</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <WorkspaceSidebar twinName={summary.twin.name} projectName={summary.project?.name ?? 'Project'} activeSection={activeSection} onSectionChange={setActiveSection} className="hidden lg:flex" />

        <main className="flex-1 relative overflow-hidden bg-surface-0">
          {activeSection !== 'overview' && activeSection !== 'vessel-layout' && activeSection !== 'design-studio' ? (
            <SectionPlaceholder section={activeSection} summary={summary} />
          ) : (
            <VesselViewport hotspots={hotspots} selectedHotspotId={selectedHotspotId} onHotspotSelect={(id) => setSelectedHotspotId((prev) => (prev === id ? null : id))} className="absolute inset-0" />
          )}

          <div className="absolute bottom-4 left-4 flex gap-2 z-10">
            {persistenceError && <div className="max-w-sm rounded border border-naval-red/30 bg-naval-red/10 px-3 py-2 text-2xs font-medium text-naval-red">{persistenceError}</div>}
            {activeAlertCount > 0 && (
              <button onClick={() => setAlertsOpen((v) => !v)} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-2xs font-semibold transition-all', alertsOpen ? 'bg-naval-red/20 border-naval-red/40 text-naval-red' : 'bg-surface-1/80 border-border text-text-muted hover:text-naval-red hover:border-naval-red/40 backdrop-blur-sm')}>
                <AlertTriangle size={11} />{activeAlertCount} Alert{activeAlertCount !== 1 ? 's' : ''}
              </button>
            )}
            <button onClick={() => setHistoryOpen((v) => !v)} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-2xs font-semibold transition-all', historyOpen ? 'bg-naval-cyan/10 border-naval-cyan/30 text-naval-cyan' : 'bg-surface-1/80 border-border text-text-muted hover:text-naval-cyan hover:border-naval-cyan/30 backdrop-blur-sm')}>
              <Clock size={11} />History
            </button>
          </div>

          {alertsOpen && activeAlertCount > 0 && <AlertsOverlay alerts={alerts} onClose={() => setAlertsOpen(false)} />}
          {historyOpen && <HistoryOverlay entries={history} onClose={() => setHistoryOpen(false)} />}
        </main>

        <InspectorPanel
          viewConfig={initialViewConfig}
          materialPresets={summary.materialPresets}
          lightingPresets={summary.lightingPresets}
          selectedHotspot={selectedHotspot}
          selectedMaterialPresetId={selectedMaterialPresetId}
          selectedLightingPresetId={selectedLightingPresetId}
          camDof={3.0}
          camFstop={30.0}
          onMaterialSelect={handleMaterialSelect}
          onLightingSelect={handleLightingSelect}
          onDofChange={handleDofChange}
          onFstopChange={handleFstopChange}
          className="hidden lg:flex"
        />
      </div>

      {showSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSidebar(false)} />
          <WorkspaceSidebar twinName={summary.twin.name} projectName={summary.project?.name ?? 'Project'} activeSection={activeSection} onSectionChange={setActiveSection} onClose={() => setShowSidebar(false)} className="absolute left-0 top-0 h-full" />
        </div>
      )}

      {showInspector && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowInspector(false)} />
          <InspectorPanel
            viewConfig={initialViewConfig}
            materialPresets={summary.materialPresets}
            lightingPresets={summary.lightingPresets}
            selectedHotspot={selectedHotspot}
            selectedMaterialPresetId={selectedMaterialPresetId}
            selectedLightingPresetId={selectedLightingPresetId}
            camDof={3.0}
            camFstop={30.0}
            onMaterialSelect={handleMaterialSelect}
            onLightingSelect={handleLightingSelect}
            onDofChange={handleDofChange}
            onFstopChange={handleFstopChange}
            onClose={() => setShowInspector(false)}
            className="absolute right-0 top-0 h-full"
          />
        </div>
      )}
    </div>
  );
}

function SectionPlaceholder({ section, summary }: { section: WorkspaceSection; summary: WorkspaceSummary }) {
  if (section === 'performance') {
    return <MetricsPanel title="Performance Tests" lines={[`Readiness score: ${summary.performance.readinessScore}%`, `Latest run: ${summary.performance.latestRunLabel}`, `Max speed: ${summary.performance.maxSpeedKnots} knots`, `Endurance: ${summary.performance.enduranceNm} nm`]} />;
  }
  if (section === 'rules') {
    return <MetricsPanel title="Rules Check" lines={[`Compliance score: ${summary.rules.complianceScore}%`, `Approved requirements: ${summary.rules.approvedRequirements}`, `In-review requirements: ${summary.rules.reviewRequirements}`, `Draft requirements: ${summary.rules.draftRequirements}`]} />;
  }
  if (section === 'team') {
    return <MetricsPanel title="Team Hub" lines={[`Active members: ${summary.team.activeMembers}`, `Online members: ${summary.team.onlineMembers}`, `Upcoming review: ${summary.team.upcomingReview}`]} />;
  }

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

function MetricsPanel({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border border-border-subtle bg-surface-1/80 backdrop-blur-md p-5 space-y-2">
        <h3 className="text-sm font-semibold tracking-wide text-text-primary uppercase">{title}</h3>
        {lines.map((line) => (
          <p key={line} className="text-xs text-text-secondary">{line}</p>
        ))}
      </div>
    </div>
  );
}
