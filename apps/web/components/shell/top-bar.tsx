'use client';

import Link from 'next/link';
import { NavalLogo } from '@/components/ui/naval-logo';
import { PanelLeft, Bell, Search, Settings } from 'lucide-react';

interface TopBarProps {
  explorerOpen: boolean;
  onToggleExplorer: () => void;
}

export function TopBar({ explorerOpen, onToggleExplorer }: TopBarProps) {
  return (
    <header className="h-11 shrink-0 flex items-center gap-2 px-3 border-b border-border-subtle bg-surface-1 z-20">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 mr-1">
        <NavalLogo size={20} />
        <span className="text-text-secondary text-xs font-medium tracking-wide hidden sm:block">
          Naval DTP
        </span>
      </Link>

      <div className="w-px h-5 bg-border-subtle mx-1" />

      {/* Explorer toggle */}
      <button
        onClick={onToggleExplorer}
        title={explorerOpen ? 'Hide explorer' : 'Show explorer'}
        className={[
          'h-7 w-7 rounded flex items-center justify-center transition-colors',
          explorerOpen
            ? 'bg-accent-dim text-accent'
            : 'text-text-muted hover:text-text-secondary hover:bg-surface-2',
        ].join(' ')}
      >
        <PanelLeft size={15} />
      </button>

      {/* Breadcrumb area */}
      <div className="flex-1 flex items-center overflow-hidden">
        <div id="breadcrumb-portal" className="flex items-center gap-1 text-xs text-text-muted overflow-hidden" />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <button className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
          <Search size={14} />
        </button>
        <button className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
          <Bell size={14} />
        </button>
        <div className="w-px h-5 bg-border-subtle mx-1" />
        <button className="h-7 w-7 rounded flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-2 transition-colors">
          <Settings size={14} />
        </button>
        <div className="w-px h-5 bg-border-subtle mx-1" />
        {/* User avatar */}
        <div className="h-6 w-6 rounded-full bg-accent-muted border border-accent/30 flex items-center justify-center text-2xs font-semibold text-accent">
          SL
        </div>
      </div>
    </header>
  );
}
