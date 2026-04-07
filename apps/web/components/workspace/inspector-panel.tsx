'use client';

import type { ReactNode } from 'react';
import { Gauge, ShieldCheck, Users } from 'lucide-react';
import type {
  ViewportHotspot,
  WorkspacePerformanceSummary,
  WorkspaceRulesSummary,
  WorkspaceSectionId,
  WorkspaceSummary,
  WorkspaceTeamSummary,
} from '@naval/domain';
import { CameraSection } from './camera-section';
import { KeyframeSection } from './keyframe-section';
import { LightingSection } from './lighting-section';
import { MaterialsSection } from './materials-section';
import { SectionCard } from './section-card';
import { StatusChip } from './status-chip';
import type { WorkspaceStudioOptions, WorkspaceStudioState } from './workspace-types';

interface InspectorPanelProps {
  summary: WorkspaceSummary;
  selectedHotspot: ViewportHotspot | null;
  activeSection: WorkspaceSectionId;
  studioOptions: WorkspaceStudioOptions;
  studioState: WorkspaceStudioState;
  performance: WorkspacePerformanceSummary;
  rules: WorkspaceRulesSummary;
  team: WorkspaceTeamSummary;
  onSelectMaterial: (presetId: string) => void;
  onSelectLighting: (presetId: string) => void;
  onSelectCameraPreset: (presetId: string) => void;
  onSelectKeyframe: (sequenceId: string) => void;
  onCameraStateChange: (cameraState: WorkspaceStudioState['cameraState']) => void;
}

export function InspectorPanel({
  summary,
  selectedHotspot,
  activeSection,
  studioOptions,
  studioState,
  performance,
  rules,
  team,
  onSelectMaterial,
  onSelectLighting,
  onSelectCameraPreset,
  onSelectKeyframe,
  onCameraStateChange,
}: InspectorPanelProps) {
  return (
    <div className="space-y-4">
      <SectionCard
        title={selectedHotspot ? selectedHotspot.title : 'Design Studio'}
        eyebrow="Inspector"
        description={
          selectedHotspot
            ? selectedHotspot.description
            : 'Select a hotspot to inspect subsystem telemetry, then shape the viewport with persisted studio presets.'
        }
        aside={<StatusChip label="Focus" value={sectionLabel(activeSection)} tone="cyan" compact />}
      >
        {selectedHotspot ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(selectedHotspot.telemetry).map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</p>
                <p className="mt-2 text-sm font-medium text-white">{String(value)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoTile icon={<Gauge size={16} />} label="Readiness" value={`${performance.readinessScore}%`} />
            <InfoTile icon={<ShieldCheck size={16} />} label="Compliance" value={`${rules.complianceScore}%`} />
            <InfoTile icon={<Users size={16} />} label="Active Team" value={`${team.activeMembers}`} />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={summaryCardTitle(activeSection)}
        eyebrow="Workspace Context"
        description={summaryCardDescription(activeSection)}
      >
        {activeSection === 'performance-tests' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile icon={<Gauge size={16} />} label="Peak Speed" value={`${performance.maxSpeedKnots} kt`} />
            <InfoTile icon={<Gauge size={16} />} label="Combat Latency" value={`${performance.combatLatencyMs} ms`} />
            <InfoTile icon={<Gauge size={16} />} label="Range" value={`${performance.enduranceNm} nm`} />
            <InfoTile icon={<Gauge size={16} />} label="Acoustic Margin" value={`${performance.acousticMarginDb} dB`} />
          </div>
        ) : activeSection === 'rules-check' ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile icon={<ShieldCheck size={16} />} label="Approved" value={`${rules.approvedRequirements}`} />
            <InfoTile icon={<ShieldCheck size={16} />} label="In Review" value={`${rules.reviewRequirements}`} />
            <InfoTile icon={<ShieldCheck size={16} />} label="Draft" value={`${rules.draftRequirements}`} />
            <InfoTile icon={<ShieldCheck size={16} />} label="Open Reviews" value={`${rules.openReviews}`} />
          </div>
        ) : activeSection === 'team-hub' ? (
          <div className="space-y-3">
            {team.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{member.name}</p>
                  <p className="mt-1 text-xs text-slate-300/75">{member.title} / {member.role}</p>
                </div>
                <StatusChip
                  label="Status"
                  value={member.status}
                  tone={member.status === 'online' ? 'green' : member.status === 'reviewing' ? 'amber' : 'neutral'}
                  compact
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-300/80">
            {selectedHotspot
              ? `${selectedHotspot.title} is linked to ${selectedHotspot.subsystem?.name ?? 'the current subsystem'} and updates the studio context when selected.`
              : `The workspace currently tracks ${summary.hotspotCount} hotspots, ${summary.alertCount} outstanding alerts, and ${team.onlineMembers} active collaborators.`}
          </p>
        )}
      </SectionCard>

      <MaterialsSection
        presets={studioOptions.materials}
        selectedPresetId={studioState.selectedMaterialPresetId}
        onSelect={onSelectMaterial}
      />
      <LightingSection
        presets={studioOptions.lightingPresets}
        selectedPresetId={studioState.selectedLightingPresetId}
        onSelect={onSelectLighting}
      />
      <CameraSection
        presets={studioOptions.cameraPresets}
        selectedPresetId={studioState.selectedCameraPresetId}
        cameraState={studioState.cameraState}
        onSelectPreset={onSelectCameraPreset}
        onCameraStateChange={onCameraStateChange}
      />
      <KeyframeSection
        sequences={studioOptions.keyframeSequences}
        selectedSequenceId={studioState.activeKeyframeSequenceId}
        onSelect={onSelectKeyframe}
      />
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
      <div className="text-cyan-100">{icon}</div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-base font-medium text-white">{value}</p>
    </div>
  );
}

function sectionLabel(section: WorkspaceSectionId) {
  return section
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function summaryCardTitle(section: WorkspaceSectionId) {
  switch (section) {
    case 'performance-tests':
      return 'Performance Summary';
    case 'rules-check':
      return 'Rules and Compliance';
    case 'team-hub':
      return 'Team Hub';
    default:
      return 'Design Studio Context';
  }
}

function summaryCardDescription(section: WorkspaceSectionId) {
  switch (section) {
    case 'performance-tests':
      return 'Latest simulation-backed metrics from the propulsion and combat replay stack.';
    case 'rules-check':
      return 'Requirement and review posture derived from seeded compliance records.';
    case 'team-hub':
      return 'Project members and recent collaboration cadence for the current twin.';
    default:
      return 'Studio controls persist through the workspace view-config API and respond to hotspot selection.';
  }
}
