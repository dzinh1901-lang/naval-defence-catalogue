'use client';

import Link from 'next/link';
import { ArrowLeft, Menu, Radar } from 'lucide-react';
import type { WorkspaceSaveState } from './workspace-types';
import { StatusChip } from './status-chip';
import type { WorkspaceSummary } from '@naval/domain';

interface WorkspaceTopBarProps {
  summary: WorkspaceSummary;
  saveState: WorkspaceSaveState;
  onOpenSidebar: () => void;
}

const saveStateLabel: Record<
  WorkspaceSaveState,
  { tone: 'neutral' | 'teal' | 'cyan' | 'amber' | 'red' | 'green'; value: string }
> = {
  idle: { tone: 'neutral', value: 'Stable' },
  saving: { tone: 'cyan', value: 'Saving' },
  saved: { tone: 'green', value: 'Synced' },
  error: { tone: 'red', value: 'Retry required' },
};

export function WorkspaceTopBar({ summary, saveState, onOpenSidebar }: WorkspaceTopBarProps) {
  const saveDisplay = saveStateLabel[saveState];

  return (
    <header className="rounded-[28px] border border-white/10 bg-slate-950/70 px-4 py-4 shadow-[0_30px_90px_rgba(2,12,21,0.38)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white md:hidden"
          aria-label="Open workspace navigation"
        >
          <Menu size={18} />
        </button>

        <Link
          href={`/projects/${summary.project.id}`}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 transition-colors hover:bg-white/8"
        >
          <ArrowLeft size={15} />
          Project
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-cyan-200/65">
            <Radar size={12} />
            Digital Twin Active
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-white">{summary.twin.name}</h1>
            <p className="text-sm text-slate-300/75">
              {summary.project.name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <StatusChip label="Runtime" value={summary.twin.runtimeStatus ?? 'Standby'} tone="neutral" />
          <StatusChip label="Coordinates" value={summary.twin.locationLabel ?? 'Pending'} tone="cyan" />
          <StatusChip label="Workspace" value={saveDisplay.value} tone={saveDisplay.tone} />
          <StatusChip
            label="Refresh"
            value={summary.twin.lastSyncedAt ? formatSync(summary.twin.lastSyncedAt) : 'Pending'}
            tone="teal"
          />
        </div>
      </div>
    </header>
  );
}

function formatSync(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })} ${date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}
