// ── RequestUser ───────────────────────────────────────────────────────────────
// The minimal user principal attached to every authenticated request.
// Populated by AuthGuard; shaped for JWT compatibility in a future M3 pass.

export interface RequestUser {
  userId: string;
  email: string;
  organizationId: string;
  /** Coarse org-level role — fine-grained project roles resolved per-request. */
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}
