'use client';

import { Activity, Antenna, Cog, RadioTower, Shield, Torus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewportHotspot } from '@naval/domain';

interface VesselHotspotLayerProps {
  hotspots: ViewportHotspot[];
  selectedHotspotId: string | null;
  onSelect: (hotspotId: string) => void;
}

const categoryIcons = {
  SENSOR: Antenna,
  WEAPON: Shield,
  PROPULSION: Cog,
  PLATFORM: Torus,
  COMMUNICATION: RadioTower,
  SUPPORT: Activity,
} as const;

export function VesselHotspotLayer({
  hotspots,
  selectedHotspotId,
  onSelect,
}: VesselHotspotLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {hotspots.map((hotspot) => {
        const Icon = categoryIcons[hotspot.category] ?? Activity;
        const selected = hotspot.id === selectedHotspotId;

        return (
          <div key={hotspot.id} className="absolute inset-0">
            <button
              type="button"
              onClick={() => onSelect(hotspot.id)}
              className={cn(
                'pointer-events-auto absolute z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-white shadow-[0_0_0_1px_rgba(34,211,238,0.14),0_0_28px_rgba(34,211,238,0.22)] transition-all',
                selected
                  ? 'border-cyan-300/70 bg-cyan-400/25 scale-110'
                  : 'border-cyan-300/35 bg-slate-950/70 hover:scale-105 hover:border-cyan-300/60',
              )}
              style={{ left: `${hotspot.anchorX}%`, top: `${hotspot.anchorY}%` }}
              aria-pressed={selected}
              aria-label={`Focus ${hotspot.title}`}
            >
              <span className="absolute inset-1 rounded-full border border-cyan-100/15" />
              {!selected ? <span className="workspace-hotspot-ping absolute inset-0 rounded-full" /> : null}
              <Icon size={16} className="relative z-10" />
            </button>

            {selected ? <SelectedHotspotCallout hotspot={hotspot} /> : null}
          </div>
        );
      })}
    </div>
  );
}

function SelectedHotspotCallout({ hotspot }: { hotspot: ViewportHotspot }) {
  const dx = hotspot.calloutX - hotspot.anchorX;
  const dy = hotspot.calloutY - hotspot.anchorY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <>
      <div
        className="absolute z-10 h-px origin-left bg-gradient-to-r from-cyan-300/80 to-cyan-300/10"
        style={{
          left: `${hotspot.anchorX}%`,
          top: `${hotspot.anchorY}%`,
          width: `${distance}%`,
          transform: `rotate(${angle}deg)`,
        }}
      />
      <div
        className="absolute z-20 min-w-[200px] max-w-[240px] rounded-2xl border border-cyan-300/20 bg-slate-950/88 p-4 shadow-[0_18px_40px_rgba(6,18,31,0.55)] backdrop-blur-xl"
        style={{ left: `${hotspot.calloutX}%`, top: `${hotspot.calloutY}%` }}
      >
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/65">
          {hotspot.category}
        </p>
        <h3 className="mt-2 text-sm font-semibold text-white">{hotspot.title}</h3>
        <p className="mt-2 text-xs leading-5 text-slate-300/80">{hotspot.status}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {Object.entries(hotspot.telemetry).slice(0, 2).map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/8 bg-white/5 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</p>
              <p className="mt-1 text-xs font-medium text-white">{String(value)}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
