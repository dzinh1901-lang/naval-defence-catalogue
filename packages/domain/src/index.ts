// ──────────────────────────────────────────────────────────────
// @naval/domain — Shared domain types, enums, and contracts
// ──────────────────────────────────────────────────────────────

// ── Enums ──────────────────────────────────────────────────────

export enum OrgPlan {
  FREE = 'FREE',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum MemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DRAFT = 'DRAFT',
}

export enum TwinStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  DEPRECATED = 'DEPRECATED',
}

export enum SubsystemStatus {
  DRAFT = 'DRAFT',
  DEFINED = 'DEFINED',
  VERIFIED = 'VERIFIED',
  DEPRECATED = 'DEPRECATED',
}

export enum IfaceDirection {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  BIDIRECTIONAL = 'BIDIRECTIONAL',
}

export enum RequirementPriority {
  MUST = 'MUST',
  SHOULD = 'SHOULD',
  MAY = 'MAY',
}

export enum RequirementStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DEPRECATED = 'DEPRECATED',
}

export enum SimulationType {
  STATIC = 'STATIC',
  DYNAMIC = 'DYNAMIC',
  MONTE_CARLO = 'MONTE_CARLO',
}

export enum SimRunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ReviewType {
  DESIGN = 'DESIGN',
  SAFETY = 'SAFETY',
  COMPLIANCE = 'COMPLIANCE',
  INTERFACE = 'INTERFACE',
}

export enum ReviewStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

export enum EvidenceType {
  DOCUMENT = 'DOCUMENT',
  TEST_RESULT = 'TEST_RESULT',
  ANALYSIS = 'ANALYSIS',
  SIMULATION_RESULT = 'SIMULATION_RESULT',
  PHOTO = 'PHOTO',
}

export enum AlertSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum HotspotCategory {
  SENSOR = 'SENSOR',
  WEAPON = 'WEAPON',
  PROPULSION = 'PROPULSION',
  PLATFORM = 'PLATFORM',
  COMMUNICATION = 'COMMUNICATION',
  SUPPORT = 'SUPPORT',
}

export const WORKSPACE_SECTION_IDS = [
  'overview',
  'vessel-layout',
  'performance-tests',
  'design-studio',
  'history-log',
  'rules-check',
  'team-hub',
] as const;

export type WorkspaceSectionId = (typeof WORKSPACE_SECTION_IDS)[number];

// ── Base ────────────────────────────────────────────────────────

export interface BaseEntity {
  id: string;
  createdAt: string; // ISO date string
  updatedAt: string;
}

// ── Organization & Users ───────────────────────────────────────

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  plan: OrgPlan;
  logoUrl?: string | null;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  title?: string | null;
  avatarUrl?: string | null;
}

export interface OrganizationMember extends BaseEntity {
  organizationId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user?: User;
  organization?: Organization;
}

// ── Projects ───────────────────────────────────────────────────

export interface Project extends BaseEntity {
  name: string;
  slug: string;
  description?: string | null;
  status: ProjectStatus;
  organizationId: string;
  organization?: Organization;
  twins?: DigitalTwin[];
  members?: ProjectMember[];
  _count?: { requirements: number; reviews: number };
}

// ── Project Membership ─────────────────────────────────────────
// Project-level access grant. Complements coarse org-level roles.

export interface ProjectMember extends BaseEntity {
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user?: User;
  project?: Project;
}

// ── Digital Twins ──────────────────────────────────────────────

export interface DigitalTwin extends BaseEntity {
  name: string;
  description?: string | null;
  version: string;
  status: TwinStatus;
  hullCode?: string | null;
  className?: string | null;
  runtimeStatus?: string | null;
  syncStatus?: string | null;
  lastSyncedAt?: string | null;
  locationLabel?: string | null;
  missionProfile?: string | null;
  projectId: string;
  project?: Project;
  subsystems?: Subsystem[];
  variants?: Variant[];
  simulations?: Simulation[];
}

// ── Subsystems ─────────────────────────────────────────────────

export interface Subsystem extends BaseEntity {
  name: string;
  identifier: string;
  description?: string | null;
  depth: number;
  status: SubsystemStatus;
  twinId: string;
  parentId?: string | null;
  parent?: Subsystem | null;
  children?: Subsystem[];
  interfaces?: Interface[];
}

// ── Interfaces ─────────────────────────────────────────────────

export interface Interface extends BaseEntity {
  name: string;
  description?: string | null;
  protocol?: string | null;
  direction: IfaceDirection;
  subsystemId: string;
}

// ── Requirements ───────────────────────────────────────────────

export interface Requirement extends BaseEntity {
  identifier: string;
  text: string;
  rationale?: string | null;
  priority: RequirementPriority;
  status: RequirementStatus;
  projectId: string;
  subsystemId?: string | null;
}

// ── Variants ───────────────────────────────────────────────────

export interface Variant extends BaseEntity {
  name: string;
  description?: string | null;
  isBaseline: boolean;
  configuration: Record<string, unknown>;
  twinId: string;
}

// ── Simulations ────────────────────────────────────────────────

export interface Simulation extends BaseEntity {
  name: string;
  description?: string | null;
  type: SimulationType;
  config: Record<string, unknown>;
  twinId: string;
  runs?: SimulationRun[];
}

export interface SimulationRun extends BaseEntity {
  status: SimRunStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  result?: Record<string, unknown> | null;
  errorMessage?: string | null;
  simulationId: string;
  requestedById?: string | null;
  requestedBy?: User | null;
}

// ── Reviews & Evidence ─────────────────────────────────────────

export interface Review extends BaseEntity {
  title: string;
  description?: string | null;
  type: ReviewType;
  status: ReviewStatus;
  projectId: string;
  createdById: string;
  createdBy?: User;
  evidence?: Evidence[];
}

export interface Evidence extends BaseEntity {
  title: string;
  description?: string | null;
  type: EvidenceType;
  uri: string;
  reviewId: string;
}

export interface Attachment extends BaseEntity {
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  reviewId?: string | null;
}

// ── Audit ──────────────────────────────────────────────────────

export interface AuditEvent {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actorId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor?: User;
}

export interface CameraState {
  yaw: number;
  pitch: number;
  zoom: number;
  fieldOfView?: number;
}

export interface WorkspaceViewConfig extends BaseEntity {
  twinId: string;
  selectedHotspotId?: string | null;
  selectedMaterialPresetId?: string | null;
  selectedLightingPresetId?: string | null;
  selectedCameraPresetId?: string | null;
  activeKeyframeSequenceId?: string | null;
  activeSection: WorkspaceSectionId;
  cameraState: CameraState;
}

export interface ViewportHotspot extends BaseEntity {
  twinId: string;
  subsystemId?: string | null;
  slug: string;
  title: string;
  description: string;
  category: HotspotCategory;
  status: string;
  anchorX: number;
  anchorY: number;
  calloutX: number;
  calloutY: number;
  healthScore: number;
  displayOrder: number;
  telemetry: Record<string, string | number>;
  subsystem?: Subsystem | null;
}

export interface AlertEvent extends BaseEntity {
  twinId: string;
  subsystemId?: string | null;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  acknowledged: boolean;
  raisedAt: string;
  subsystem?: Subsystem | null;
}

export interface TwinActivityLog extends BaseEntity {
  twinId: string;
  actorId?: string | null;
  subsystemId?: string | null;
  eventType: string;
  summary: string;
  detail?: string | null;
  occurredAt: string;
  actorName?: string | null;
  actorTitle?: string | null;
  subsystemName?: string | null;
}

export interface MaterialPreset extends BaseEntity {
  twinId: string;
  key: string;
  name: string;
  description?: string | null;
  hullColor: string;
  deckColor: string;
  accentColor: string;
  finish: string;
  roughness: number;
  reflectivity: number;
  thermalProfile?: string | null;
  isDefault: boolean;
}

export interface LightingPreset extends BaseEntity {
  twinId: string;
  key: string;
  name: string;
  description?: string | null;
  environmentPreset: string;
  accentColor: string;
  ambientIntensity: number;
  directionalIntensity: number;
  fogDensity: number;
  shadowBias: number;
  isDefault: boolean;
}

export interface CameraPreset extends BaseEntity {
  twinId: string;
  key: string;
  name: string;
  description?: string | null;
  focusLabel: string;
  yaw: number;
  pitch: number;
  zoom: number;
  fieldOfView: number;
  transitionMs: number;
  isDefault: boolean;
}

export interface KeyframeSequence extends BaseEntity {
  twinId: string;
  key: string;
  name: string;
  description?: string | null;
  durationSeconds: number;
  keyframes: Array<Record<string, unknown>>;
  isDefault: boolean;
}

export interface WorkspacePerformanceSummary {
  readinessScore: number;
  latestRunLabel: string;
  maxSpeedKnots: number;
  enduranceNm: number;
  acousticMarginDb: number;
  hullStressMarginPct: number;
  combatLatencyMs: number;
}

export interface WorkspaceRulesSummary {
  complianceScore: number;
  approvedRequirements: number;
  reviewRequirements: number;
  draftRequirements: number;
  openReviews: number;
  criticalRule: string;
}

export interface WorkspaceTeamMember {
  id: string;
  name: string;
  title?: string | null;
  role: MemberRole;
  status: 'online' | 'reviewing' | 'offline';
  lastActiveAt?: string | null;
}

export interface WorkspaceTeamSummary {
  activeMembers: number;
  onlineMembers: number;
  upcomingReview: string;
  members: WorkspaceTeamMember[];
}

export interface WorkspaceSummary {
  twin: DigitalTwin;
  project: Pick<Project, 'id' | 'name' | 'slug' | 'status' | 'organizationId'>;
  organization: Pick<Organization, 'id' | 'name' | 'slug' | 'plan'>;
  subsystemTree: Subsystem[];
  hotspotCount: number;
  alertCount: number;
  performance: WorkspacePerformanceSummary;
  rules: WorkspaceRulesSummary;
  team: WorkspaceTeamSummary;
}

export interface WorkspaceViewConfigPayload {
  config: WorkspaceViewConfig;
  materials: MaterialPreset[];
  lightingPresets: LightingPreset[];
  cameraPresets: CameraPreset[];
  keyframeSequences: KeyframeSequence[];
}

export interface WorkspaceViewConfigUpdateInput {
  selectedHotspotId?: string | null;
  selectedMaterialPresetId?: string | null;
  selectedLightingPresetId?: string | null;
  selectedCameraPresetId?: string | null;
  activeKeyframeSequenceId?: string | null;
  activeSection?: WorkspaceSectionId;
  cameraState?: Partial<CameraState>;
}

export interface WorkspaceDashboardKpi {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend: 'up' | 'down' | 'steady';
  deltaText?: string;
}

export interface WorkspaceDashboardTrendPoint {
  id: string;
  label: string;
  timestamp: string | null;
  readinessScore: number;
  combatLatencyMs: number;
  hullStressMarginPct: number;
}

export interface WorkspaceDashboardBreakdownRow {
  hotspotId: string;
  subsystemName: string;
  subsystemIdentifier: string;
  category: HotspotCategory;
  hotspotStatus: string;
  healthScore: number;
  openAlerts: number;
  telemetry: Record<string, string | number>;
}

export interface WorkspaceDashboardAgentInfo {
  name: string;
  status: 'online' | 'degraded';
  modelLabel: string;
  endpointPath: string;
  capabilities: string[];
}

export interface WorkspaceDashboardPayload {
  summary: WorkspaceSummary;
  performance: WorkspacePerformanceSummary;
  rules: WorkspaceRulesSummary;
  team: WorkspaceTeamSummary;
  viewConfig: WorkspaceViewConfigPayload;
  hotspots: ViewportHotspot[];
  kpis: WorkspaceDashboardKpi[];
  trends: WorkspaceDashboardTrendPoint[];
  breakdown: WorkspaceDashboardBreakdownRow[];
  agent: WorkspaceDashboardAgentInfo;
  assumptions: string[];
}

export interface WorkspaceAgentReference {
  kind: string;
  id: string;
  title: string;
  score: number;
}

export interface WorkspaceAgentCollaborationResponse {
  prompt: string;
  generatedAt: string;
  summary: string;
  recommendations: string[];
  references: WorkspaceAgentReference[];
}

// ── API Response wrappers ──────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

// ── Paginated list ─────────────────────────────────────────────

export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

// ── Workspace ─────────────────────────────────────────────────────────────────

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export interface MaterialPreset extends BaseEntity {
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  colorHex?: string | null;
}

export interface LightingPreset extends BaseEntity {
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  intensity: number;
}

export interface WorkspaceViewConfig extends BaseEntity {
  twinId: string;
  selectedMaterialId?: string | null;
  selectedLightingId?: string | null;
  camDof: number;
  camFstop: number;
  selectedMaterial?: MaterialPreset | null;
  selectedLighting?: LightingPreset | null;
}

export interface ViewportHotspot extends BaseEntity {
  twinId: string;
  label: string;
  description?: string | null;
  subsystemId?: string | null;
  posX: number;
  posY: number;
  subsystem?: Pick<Subsystem, 'id' | 'name' | 'identifier' | 'status'> | null;
}

export interface AlertEvent extends BaseEntity {
  twinId: string;
  title: string;
  message?: string | null;
  severity: AlertSeverity;
  resolvedAt?: string | null;
}

export interface TwinActivityLog {
  id: string;
  twinId: string;
  actorId?: string | null;
  action: string;
  detail?: string | null;
  version?: string | null;
  createdAt: string;
  actor?: Pick<User, 'id' | 'name' | 'email'> | null;
}


export interface WorkspacePerformanceSummary {
  totalSimulations: number;
  completedRuns: number;
  runningRuns: number;
  failedRuns: number;
  passRate: number;
}

export interface WorkspaceRulesSummary {
  approvedRequirements: number;
  reviewRequirements: number;
  rejectedRequirements: number;
  complianceScore: number;
}

export interface WorkspaceTeamSummary {
  totalMembers: number;
  adminMembers: number;
  memberMembers: number;
  viewerMembers: number;
  recentActivityCount: number;
}
export interface WorkspaceSummary {
  twin: DigitalTwin;
  project: Project;
  viewConfig: WorkspaceViewConfig | null;
  alertCount: number;
  hotspotCount: number;
  activityCount: number;
  materialPresets: MaterialPreset[];
  lightingPresets: LightingPreset[];
  performanceSummary: WorkspacePerformanceSummary;
  rulesSummary: WorkspaceRulesSummary;
  teamSummary: WorkspaceTeamSummary;
}

export interface UpdateViewConfigDto {
  selectedMaterialId?: string | null;
  selectedLightingId?: string | null;
  camDof?: number;
  camFstop?: number;
}
