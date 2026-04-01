'use client';

import type { ViewportHotspot } from '@naval/domain';
import { VesselHotspotLayer } from './VesselHotspotLayer';
import { cn } from '@/lib/utils';

interface VesselViewportProps {
  hotspots: ViewportHotspot[];
  selectedHotspotId: string | null;
  onHotspotSelect: (id: string) => void;
  className?: string;
}

export function VesselViewport({
  hotspots,
  selectedHotspotId,
  onHotspotSelect,
  className,
}: VesselViewportProps) {
  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {/* ── Cinematic vessel backdrop ─────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900" />

      {/* Sky gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-transparent to-slate-900/60" />

      {/* Distant headland / cliff */}
      <div
        className="absolute right-0 top-0 w-1/3 h-3/5 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at 80% 0%, #374151 0%, #1e293b 40%, transparent 80%)',
        }}
      />

      {/* Sea surface */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2/5"
        style={{
          background:
            'linear-gradient(to bottom, rgba(15,23,42,0) 0%, rgba(15,23,42,0.6) 40%, rgba(15,23,42,0.9) 100%)',
        }}
      />

      {/* Sea glint / reflection */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(6,182,212,0.15) 3px, rgba(6,182,212,0.15) 4px)',
        }}
      />

      {/* ── Vessel silhouette (SVG-based) ─────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <VesselSilhouette />
      </div>

      {/* ── Vignette ──────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(11,13,17,0.6) 100%)',
        }}
      />

      {/* ── Hotspot layer ─────────────────────────────────────────────────── */}
      <VesselHotspotLayer
        hotspots={hotspots}
        selectedId={selectedHotspotId}
        onSelect={onHotspotSelect}
      />
    </div>
  );
}

/** SVG schematic of a modern naval surface combatant / patrol vessel. */
function VesselSilhouette() {
  return (
    <svg
      viewBox="0 0 820 280"
      className="w-[88%] max-w-3xl opacity-85"
      fill="none"
      aria-hidden
    >
      {/* Hull */}
      <path
        d="M 60 200 L 120 200 L 130 220 L 690 220 L 720 200 L 780 195 L 790 205 L 740 215 L 700 230 L 120 230 L 80 215 Z"
        fill="#334155"
        stroke="#475569"
        strokeWidth="1"
      />
      {/* Superstructure main body */}
      <path
        d="M 220 200 L 230 160 L 560 160 L 590 175 L 590 200 Z"
        fill="#1e293b"
        stroke="#334155"
        strokeWidth="1"
      />
      {/* Forward superstructure */}
      <path
        d="M 280 160 L 295 120 L 420 120 L 430 140 L 420 160 Z"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="1"
      />
      {/* Mast */}
      <rect x="350" y="60" width="6" height="65" fill="#475569" />
      <rect x="310" y="80" width="90" height="4" fill="#475569" />
      <rect x="330" y="90" width="50" height="3" fill="#334155" />
      {/* Radar dome */}
      <ellipse cx="353" cy="62" rx="18" ry="10" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      {/* Funnel */}
      <path d="M 470 140 L 480 100 L 510 100 L 510 140 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <rect x="475" y="95" width="40" height="8" rx="2" fill="#0f172a" />
      {/* Aft deck */}
      <rect x="560" y="175" width="140" height="25" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      {/* VLS cells forward */}
      <g fill="#0f172a" stroke="#475569" strokeWidth="0.5">
        <rect x="170" y="175" width="16" height="26" />
        <rect x="190" y="175" width="16" height="26" />
        <rect x="210" y="175" width="16" height="26" />
      </g>
      {/* Main gun */}
      <ellipse cx="140" cy="190" rx="22" ry="12" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <rect x="138" y="165" width="6" height="28" rx="3" fill="#334155" />
      {/* Bridge windows */}
      <g fill="rgba(6,182,212,0.25)" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5">
        <rect x="302" y="133" width="14" height="10" rx="1" />
        <rect x="320" y="133" width="14" height="10" rx="1" />
        <rect x="338" y="133" width="14" height="10" rx="1" />
        <rect x="356" y="133" width="14" height="10" rx="1" />
        <rect x="374" y="133" width="14" height="10" rx="1" />
        <rect x="392" y="133" width="14" height="10" rx="1" />
      </g>
      {/* Hull waterline glow */}
      <path
        d="M 100 220 Q 410 215 720 220"
        stroke="rgba(6,182,212,0.25)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Running lights */}
      <circle cx="790" cy="203" r="3" fill="rgba(34,197,94,0.8)" />
      <circle cx="60" cy="200" r="3" fill="rgba(239,68,68,0.8)" />
    </svg>
  );
}
