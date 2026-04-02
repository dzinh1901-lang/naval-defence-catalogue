/**
 * Naval DTP — Server-side API client
 *
 * Used exclusively in Next.js server components and route handlers.
 * All fetch calls go directly to the NestJS API from the server;
 * no credentials or internal URLs are ever exposed to the browser.
 *
 * The API_URL env var should be set to the internal address of the API
 * (e.g. http://localhost:4000 locally, or the internal service URL in prod).
 */

import type {
  Project,
  DigitalTwin,
  Subsystem,
  Requirement,
  Variant,
  Review,
  Evidence,
  WorkspaceSummary,
  ViewportHotspot,
  AlertEvent,
  TwinActivityLog,
  WorkspaceViewConfig,
  UpdateViewConfigDto,
} from '@naval/domain';
import { getServerApiBase, getServerApiHeaders } from './env';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${getServerApiBase()}/api/v1${path}`;
  const headers = await getServerApiHeaders(options?.headers);

  const res = await fetch(url, {
    ...options,
    headers,
    // Next.js cache: revalidate every 30 s by default.
    // Individual callers can override via next: { revalidate: ... } or cache: 'no-store'.
    next: { revalidate: 30 },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiClientError(res.status, path, body);
  }

  return res.json() as Promise<T>;
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    public readonly body: string,
  ) {
    super(`API ${status} at ${path}: ${body}`);
    this.name = 'ApiClientError';
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isExpiredToken(): boolean {
    return this.isUnauthorized && this.body.toLowerCase().includes('expired');
  }
}

// ── Projects ─────────────────────────────────────────────────────────────────

/** List all projects, optionally filtered. */
export async function listProjects(opts?: {
  organizationId?: string;
  status?: string;
}): Promise<Project[]> {
  const params = new URLSearchParams();
  if (opts?.organizationId) params.set('organizationId', opts.organizationId);
  if (opts?.status) params.set('status', opts.status);
  const qs = params.toString() ? `?${params}` : '';
  return apiFetch<Project[]>(`/projects${qs}`);
}

/** Get a single project by ID (includes twins list). */
export async function getProject(id: string): Promise<Project | null> {
  try {
    return await apiFetch<Project>(`/projects/${id}`);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 404) return null;
    throw err;
  }
}

// ── Digital Twins ─────────────────────────────────────────────────────────────

/** List digital twins for a project. */
export async function listTwins(projectId: string): Promise<DigitalTwin[]> {
  return apiFetch<DigitalTwin[]>(`/twins/project/${projectId}`);
}

/** Get a single digital twin by ID (includes subsystem tree, variants, simulations). */
export async function getTwin(id: string): Promise<DigitalTwin | null> {
  try {
    return await apiFetch<DigitalTwin>(`/twins/${id}`);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 404) return null;
    throw err;
  }
}

// ── Subsystems ────────────────────────────────────────────────────────────────

/** List subsystems for a digital twin. */
export async function listSubsystems(twinId: string): Promise<Subsystem[]> {
  return apiFetch<Subsystem[]>(`/subsystems?twinId=${twinId}`);
}

/** Get a single subsystem by ID (includes children, interfaces, requirements). */
export async function getSubsystem(id: string): Promise<Subsystem | null> {
  try {
    return await apiFetch<Subsystem>(`/subsystems/${id}`);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 404) return null;
    throw err;
  }
}

// ── Requirements ──────────────────────────────────────────────────────────────

/** List requirements for a project. */
export async function listRequirements(
  projectId: string,
  opts?: { subsystemId?: string },
): Promise<Requirement[]> {
  const params = new URLSearchParams();
  if (opts?.subsystemId !== undefined) params.set('subsystemId', opts.subsystemId);
  const qs = params.toString() ? `?${params}` : '';
  return apiFetch<Requirement[]>(`/requirements/project/${projectId}${qs}`);
}

// ── Variants ──────────────────────────────────────────────────────────────────

/** List variants for a digital twin. */
export async function listVariants(twinId: string): Promise<Variant[]> {
  return apiFetch<Variant[]>(`/variants/twin/${twinId}`);
}

// ── Reviews ───────────────────────────────────────────────────────────────────

/** List reviews for a project. */
export async function listReviews(projectId: string): Promise<Review[]> {
  return apiFetch<Review[]>(`/reviews/project/${projectId}`);
}

/** Get a single review by ID. */
export async function getReview(id: string): Promise<Review | null> {
  try {
    return await apiFetch<Review>(`/reviews/${id}`);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 404) return null;
    throw err;
  }
}

// ── Evidence ──────────────────────────────────────────────────────────────────

/** List evidence for a review. */
export async function listEvidence(reviewId: string): Promise<Evidence[]> {
  return apiFetch<Evidence[]>(`/evidence/review/${reviewId}`);
}

// ── Workspace ─────────────────────────────────────────────────────────────────

/** GET /workspace/:twinId — workspace summary */
export async function getWorkspaceSummary(twinId: string): Promise<WorkspaceSummary | null> {
  try {
    return await apiFetch<WorkspaceSummary>(`/workspace/${twinId}`);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 404) return null;
    throw err;
  }
}

/** GET /workspace/:twinId/hotspots */
export async function getWorkspaceHotspots(twinId: string): Promise<ViewportHotspot[]> {
  return apiFetch<ViewportHotspot[]>(`/workspace/${twinId}/hotspots`);
}

/** GET /workspace/:twinId/alerts */
export async function getWorkspaceAlerts(twinId: string): Promise<AlertEvent[]> {
  return apiFetch<AlertEvent[]>(`/workspace/${twinId}/alerts`);
}

/** GET /workspace/:twinId/history */
export async function getWorkspaceHistory(twinId: string): Promise<TwinActivityLog[]> {
  return apiFetch<TwinActivityLog[]>(`/workspace/${twinId}/history`);
}

/** GET /workspace/:twinId/view-config */
export async function getWorkspaceViewConfig(twinId: string): Promise<WorkspaceViewConfig | null> {
  try {
    return await apiFetch<WorkspaceViewConfig>(`/workspace/${twinId}/view-config`);
  } catch (err) {
    if (err instanceof ApiClientError && err.status === 404) return null;
    throw err;
  }
}

/** PATCH /workspace/:twinId/view-config — client-side mutation */
export async function updateWorkspaceViewConfig(
  twinId: string,
  dto: UpdateViewConfigDto,
): Promise<WorkspaceViewConfig> {
  return apiFetch<WorkspaceViewConfig>(`/workspace/${twinId}/view-config`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
    // Disable Next.js cache for mutations.
    cache: 'no-store',
  });
}
