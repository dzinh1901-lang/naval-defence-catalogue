'use client';

import { cn } from '@/lib/utils';
import type { LightingPreset } from '@naval/domain';
import { SectionCard } from './SectionCard';

interface LightingSectionProps {
  presets: LightingPreset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const LIGHTING_COLORS = [
  'from-orange-600/80 to-yellow-500/60',   // Golden Hour
  'from-slate-900/90 to-blue-950/70',       // Midnight Stealth
  'from-sky-200/60 to-slate-300/40',        // Scandinavian Natural
  'from-indigo-800/80 to-purple-700/60',    // Deep Night
];

export function LightingSection({ presets, selectedId, onSelect }: LightingSectionProps) {
  return (
    <SectionCard title="Lighting Presets">
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset, idx) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset.id)}
            className={cn(
              'group flex flex-col items-center gap-1.5 p-0.5 rounded transition-all',
              selectedId === preset.id
                ? 'ring-1 ring-naval-cyan'
                : 'ring-1 ring-transparent hover:ring-border',
            )}
          >
            <div className="w-full aspect-square rounded overflow-hidden">
              <div
                className={cn(
                  'w-full h-full bg-gradient-to-br',
                  LIGHTING_COLORS[idx % LIGHTING_COLORS.length],
                )}
              />
            </div>
            <span className="text-2xs text-text-muted group-hover:text-text-secondary leading-tight text-center truncate w-full">
              {preset.name}
            </span>
          </button>
        ))}
        {presets.length === 0 && (
          <p className="col-span-3 text-2xs text-text-dim italic py-2">No lighting presets</p>
        )}
      </div>
    </SectionCard>
  );
}
