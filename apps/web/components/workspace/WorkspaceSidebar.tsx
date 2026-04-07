'use client';

import {
  LayoutGrid,
  Ship,
  FlaskConical,
  PenTool,
  History,
  ShieldCheck,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkspaceSection } from './WorkspaceShell';

const NAV_ITEMS: { id: WorkspaceSection; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'vessel-layout', label: 'Vessel Layout', icon: Ship },
  { id: 'performance', label: 'Performance Tests', icon: FlaskConical },
  { id: 'design-studio', label: 'Design Studio', icon: PenTool },
  { id: 'history', label: 'History Log', icon: History },
  { id: 'rules', label: 'Rules Check', icon: ShieldCheck },
  { id: 'team', label: 'Team Hub', icon: Users },
];

interface WorkspaceSidebarProps {
  twinName: string;
  projectName: string;
  activeSection: WorkspaceSection;
  onSectionChange: (s: WorkspaceSection) => void;
  className?: string;
  onClose?: () => void;
}

export function WorkspaceSidebar({
  twinName,
  activeSection,
  onSectionChange,
  className,
  onClose,
}: WorkspaceSidebarProps) {
  return (
    <aside className={cn('w-60 shrink-0 flex flex-col bg-surface-1 border-r border-border-subtle overflow-hidden', className)}>
      <div className="h-11 flex items-center px-3 gap-2 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-accent flex items-center justify-center text-white font-bold text-xs">D</div>
          <span className="text-sm font-bold text-text-primary tracking-tight">DesignOS</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto md:hidden h-7 w-7 rounded border border-border-subtle text-text-muted hover:text-text-primary">
            <X size={14} className="mx-auto" />
          </button>
        )}
      </div>

      <div className="px-3 py-2.5 border-b border-border-subtle shrink-0">
        <button className="w-full flex items-start justify-between gap-1 group">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-text-primary truncate text-left">{twinName}</div>
            <div className="text-2xs text-naval-teal mt-0.5">Active</div>
          </div>
          <ChevronDown size={12} className="text-text-dim mt-1 shrink-0 group-hover:text-text-muted transition-colors" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-1.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              onSectionChange(id);
              onClose?.();
            }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors',
              activeSection === id
                ? 'bg-accent-dim text-naval-cyan'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2',
            )}
          >
            <Icon size={14} className={cn('shrink-0', activeSection === id ? 'text-naval-cyan' : 'text-text-dim')} />
            <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-border-subtle py-1.5">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
          <Settings size={14} className="shrink-0 text-text-dim" />
          <span className="text-xs font-medium tracking-wide uppercase">Settings</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
          <LogOut size={14} className="shrink-0 text-text-dim" />
          <span className="text-xs font-medium tracking-wide uppercase">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
