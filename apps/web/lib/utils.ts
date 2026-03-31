import type { ProjectStatus, TwinStatus, SubsystemStatus, RequirementStatus } from '@naval/domain';
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statusColor(status: ProjectStatus | TwinStatus | SubsystemStatus | RequirementStatus): string {
  const map: Record<string, string> = {
    ACTIVE: 'text-naval-green',
    VERIFIED: 'text-naval-green',
    APPROVED: 'text-naval-green',
    DEFINED: 'text-naval-cyan',
    IN_REVIEW: 'text-naval-cyan',
    REVIEW: 'text-naval-amber',
    DRAFT: 'text-text-muted',
    LOCKED: 'text-naval-indigo',
    DEPRECATED: 'text-text-dim',
    REJECTED: 'text-naval-red',
    ARCHIVED: 'text-text-dim',
    CLOSED: 'text-text-dim',
    OPEN: 'text-naval-amber',
  };
  return map[status] ?? 'text-text-muted';
}

export function statusDotColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'bg-naval-green',
    VERIFIED: 'bg-naval-green',
    APPROVED: 'bg-naval-green',
    DEFINED: 'bg-naval-cyan',
    IN_REVIEW: 'bg-naval-cyan',
    REVIEW: 'bg-naval-amber',
    DRAFT: 'bg-zinc-500',
    DEPRECATED: 'bg-zinc-600',
    REJECTED: 'bg-naval-red',
    FAILED: 'bg-naval-red',
    ARCHIVED: 'bg-zinc-600',
    OPEN: 'bg-naval-amber',
    LOCKED: 'bg-naval-indigo',
  };
  return map[status] ?? 'bg-zinc-500';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
