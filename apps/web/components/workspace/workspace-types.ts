import type {
  AlertEvent,
  CameraState,
  CameraPreset,
  KeyframeSequence,
  LightingPreset,
  MaterialPreset,
  TwinActivityLog,
  ViewportHotspot,
  WorkspacePerformanceSummary,
  WorkspaceRulesSummary,
  WorkspaceSectionId,
  WorkspaceSummary,
  WorkspaceTeamSummary,
  WorkspaceViewConfigPayload,
} from '@naval/domain';

export interface WorkspaceRouteData {
  summary: WorkspaceSummary;
  hotspots: ViewportHotspot[];
  alerts: AlertEvent[];
  history: TwinActivityLog[];
  viewConfig: WorkspaceViewConfigPayload;
  performance: WorkspacePerformanceSummary;
  rules: WorkspaceRulesSummary;
  team: WorkspaceTeamSummary;
}

export interface WorkspaceStudioState {
  activeSection: WorkspaceSectionId;
  selectedHotspotId: string | null;
  selectedMaterialPresetId: string | null;
  selectedLightingPresetId: string | null;
  selectedCameraPresetId: string | null;
  activeKeyframeSequenceId: string | null;
  cameraState: CameraState;
}

export type WorkspaceSaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface WorkspaceNavItem {
  id: WorkspaceSectionId;
  label: string;
  shortLabel: string;
}

export const WORKSPACE_NAV_ITEMS: WorkspaceNavItem[] = [
  { id: 'overview', label: 'Overview', shortLabel: 'Overview' },
  { id: 'vessel-layout', label: 'Vessel Layout', shortLabel: 'Layout' },
  { id: 'performance-tests', label: 'Performance Tests', shortLabel: 'Tests' },
  { id: 'design-studio', label: 'Design Studio', shortLabel: 'Studio' },
  { id: 'history-log', label: 'History Log', shortLabel: 'History' },
  { id: 'rules-check', label: 'Rules Check', shortLabel: 'Rules' },
  { id: 'team-hub', label: 'Team Hub', shortLabel: 'Team' },
];

export interface WorkspaceStudioOptions {
  materials: MaterialPreset[];
  lightingPresets: LightingPreset[];
  cameraPresets: CameraPreset[];
  keyframeSequences: KeyframeSequence[];
}
