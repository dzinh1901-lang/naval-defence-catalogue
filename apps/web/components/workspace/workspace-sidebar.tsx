'use client';

import { Activity, Boxes, FileClock, LayoutPanelLeft, ShieldCheck, SlidersHorizontal, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusChip } from './status-chip';
import type { WorkspaceNavItem } from './workspace-types';
import type { WorkspaceSectionId, WorkspaceSummary } from '@naval/domain';

interface WorkspaceSidebarProps {
  summary: WorkspaceSummary;
  items: WorkspaceNavItem[];
  activeSection: WorkspaceSectionId;
  onSelect: (section: WorkspaceSectionId) => void;
  className?: string;
}

const icons: Record<WorkspaceSectionId, typeof LayoutPanelLeft> = {
  overview: LayoutPanelLeft,
  'vessel-layout': Boxes,
  'performance-tests': Activity,
  'design-studio': SlidersHorizontal,
  'history-log': FileClock,
  'rules-check': ShieldCheck,
  'team-hub': Users,
};

export function WorkspaceSidebar({
  summary,
  items,
  activeSection,
  onSelect,
  className,
}: WorkspaceSidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col rounded-[28px] border border-white/10 bg-slate-950/70 p-4 backdrop-blur-2xl',
        className,
      )}
    >
      <div className="mb-6 rounded-[20px] border border-cyan-400/15 bg-cyan-400/5 p-4">
        <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/65">Primary Twin</p>
        <h2 className="mt-3 text-lg font-semibold text-white">{summary.twin.name}</h2>
        <p className="mt-2 text-xs leading-5 text-slate-300/80">
          {summary.twin.className} / {summary.twin.hullCode}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusChip label="Sync" value={summary.twin.syncStatus ?? 'Standby'} tone="teal" compact />
          <StatusChip label="Alerts" value={summary.alertCount} tone={summary.alertCount > 0 ? 'amber' : 'green'} compact />
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = icons[item.id];
          const isActive = item.id === activeSection;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all',
                isActive
                  ? 'bg-cyan-400/12 text-white shadow-[inset_0_0_0_1px_rgba(56,189,248,0.24)]'
                  : 'text-slate-300/80 hover:bg-white/5 hover:text-white',
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl border',
                  isActive
                    ? 'border-cyan-300/30 bg-cyan-400/15 text-cyan-100'
                    : 'border-white/10 bg-white/5 text-slate-300/80',
                )}
              >
                <Icon size={16} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="mt-1 block text-[11px] uppercase tracking-[0.22em] text-white/45">
                  Workspace
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[20px] border border-white/8 bg-white/5 p-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Mission Profile</p>
        <p className="mt-3 text-sm font-medium text-white">{summary.twin.missionProfile}</p>
        <p className="mt-3 text-xs leading-5 text-slate-300/75">
          {summary.twin.locationLabel}
        </p>
      </div>
    </aside>
  );
}
