'use client';

import { cn } from '@/lib/utils';
import type { MaterialPreset } from '@naval/domain';
import { SectionCard } from './SectionCard';

interface MaterialsSectionProps {
  presets: MaterialPreset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const MATERIAL_GRADIENTS: Record<string, string> = {
  default: 'from-amber-900/80 to-amber-700/60',
};

export function MaterialsSection({ presets, selectedId, onSelect }: MaterialsSectionProps) {
  return (
    <SectionCard title="Materials">
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => (
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
            {/* Swatch */}
            <div
              className="w-full aspect-square rounded overflow-hidden"
              style={{ background: preset.hullColor ?? undefined }}
            >
              {preset.hullColor ? (
                <div className="w-full h-full" style={{ backgroundColor: preset.hullColor }} />
              ) : (
                <div
                  className={cn(
                    'w-full h-full bg-gradient-to-br',
                    MATERIAL_GRADIENTS['default'],
                  )}
                />
              )}
            </div>
            <span className="text-2xs text-text-muted group-hover:text-text-secondary leading-tight text-center truncate w-full">
              {preset.name}
            </span>
          </button>
        ))}
        {presets.length === 0 && (
          <p className="col-span-3 text-2xs text-text-dim italic py-2">No material presets</p>
        )}
      </div>
    </SectionCard>
  );
}
