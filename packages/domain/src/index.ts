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

export interface WorkspaceSummary {
  twin: DigitalTwin;
  project: Project;
  viewConfig: WorkspaceViewConfig | null;
  alertCount: number;
  hotspotCount: number;
  activityCount: number;
  materialPresets: MaterialPreset[];
  lightingPresets: LightingPreset[];
}

export interface UpdateViewConfigDto {
  selectedMaterialId?: string | null;
  selectedLightingId?: string | null;
  camDof?: number;
  camFstop?: number;
}
