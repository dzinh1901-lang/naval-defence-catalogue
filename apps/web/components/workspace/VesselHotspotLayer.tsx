'use client';

import { cn } from '@/lib/utils';
import type { ViewportHotspot } from '@naval/domain';

interface VesselHotspotLayerProps {
  hotspots: ViewportHotspot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function VesselHotspotLayer({ hotspots, selectedId, onSelect }: VesselHotspotLayerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {hotspots.map((hotspot) => (
        <HotspotMarker
          key={hotspot.id}
          hotspot={hotspot}
          selected={selectedId === hotspot.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

interface HotspotMarkerProps {
  hotspot: ViewportHotspot;
  selected: boolean;
  onSelect: (id: string) => void;
}

function HotspotMarker({ hotspot, selected, onSelect }: HotspotMarkerProps) {
  const CALLOUT_LENGTH = 36;

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${hotspot.posX}%`,
        top: `${hotspot.posY}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Callout line + label */}
      <div
        className="absolute"
        style={{
          bottom: '100%',
          left: '50%',
          marginBottom: 4,
          transform: 'translateX(-50%)',
        }}
      >
        <div
          className="flex flex-col items-center"
          style={{ gap: 0 }}
        >
          {/* Label */}
          <div
            className={cn(
              'whitespace-nowrap text-2xs px-1.5 py-0.5 rounded border mb-1 font-medium transition-all',
              selected
                ? 'bg-naval-cyan text-surface-0 border-naval-cyan shadow-lg shadow-naval-cyan/30'
                : 'bg-surface-1/90 text-naval-cyan border-naval-cyan/40 backdrop-blur-sm',
            )}
          >
            {hotspot.label}
          </div>
          {/* Vertical line */}
          <div
            className={cn(
              'w-px transition-colors',
              selected ? 'bg-naval-cyan' : 'bg-naval-cyan/50',
            )}
            style={{ height: CALLOUT_LENGTH }}
          />
        </div>
      </div>

      {/* Hotspot dot */}
      <button
        onClick={() => onSelect(hotspot.id)}
        className={cn(
          'relative flex items-center justify-center rounded-full transition-all',
          selected
            ? 'h-4 w-4 bg-naval-cyan shadow-lg shadow-naval-cyan/50'
            : 'h-3.5 w-3.5 bg-naval-cyan/60 hover:bg-naval-cyan hover:scale-125',
        )}
      >
        {/* Pulse ring when selected */}
        {selected && (
          <span className="absolute inset-0 rounded-full bg-naval-cyan/30 animate-ping" />
        )}
        <span className="relative h-1.5 w-1.5 rounded-full bg-surface-0" />
      </button>
    </div>
  );
}
