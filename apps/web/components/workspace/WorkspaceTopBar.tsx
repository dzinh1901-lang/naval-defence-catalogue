'use client';

import Link from 'next/link';
import { RefreshCw, MapPin } from 'lucide-react';
import { NavalLogo } from '@/components/ui/naval-logo';
import { StatusChip } from './StatusChip';

interface WorkspaceTopBarProps {
  twinName: string;
  projectName: string;
  syncPoints?: number;
  lat?: number;
  lng?: number;
}

export function WorkspaceTopBar({
  twinName,
  projectName,
  syncPoints = 1244,
  lat = 43.73,
  lng = 7.42,
}: WorkspaceTopBarProps) {
  const latStr = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? 'E' : 'W'}`;

  return (
    <header className="h-11 shrink-0 flex items-center gap-3 px-4 border-b border-border-subtle bg-surface-1 z-20">
      {/* Brand + title */}
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <NavalLogo size={18} />
        </Link>
        <div className="w-px h-5 bg-border-subtle" />
        <span className="text-xs font-semibold text-text-primary truncate max-w-[180px]">
          {projectName}
        </span>
      </div>

      {/* Right status chips */}
      <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
        <StatusChip
          label="Digital Twin"
          value="Active"
          variant="active"
          pulse
        />
        <StatusChip
          label="Sync"
          value={`${syncPoints.toLocaleString()} pts`}
          variant="info"
          icon={<RefreshCw size={9} />}
        />
        <StatusChip
          label={`Coord: ${latStr}, ${lngStr}`}
          variant="muted"
          icon={<MapPin size={9} />}
        />
      </div>
    </header>
  );
}
