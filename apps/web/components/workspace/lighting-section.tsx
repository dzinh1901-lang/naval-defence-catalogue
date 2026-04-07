'use client';

import { cn } from '@/lib/utils';
import type { LightingPreset } from '@naval/domain';
import { SectionCard } from './section-card';

interface LightingSectionProps {
  presets: LightingPreset[];
  selectedPresetId: string | null;
  onSelect: (presetId: string) => void;
}

export function LightingSection({
  presets,
  selectedPresetId,
  onSelect,
}: LightingSectionProps) {
  return (
    <SectionCard
      title="Lighting Presets"
      eyebrow="Design Studio"
      description="Scene illumination presets persisted through the workspace API."
    >
      <div className="space-y-3">
        {presets.map((preset) => {
          const selected = preset.id === selectedPresetId;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={cn(
                'w-full rounded-2xl border px-4 py-3 text-left transition-all',
                selected
                  ? 'border-teal-300/30 bg-teal-400/10'
                  : 'border-white/8 bg-white/5 hover:bg-white/8',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{preset.name}</span>
                    <span
                      className="h-3 w-3 rounded-full border border-white/15"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-300/75">{preset.description}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-slate-950/45 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                  {preset.environmentPreset}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-300/75">
                <Meta label="Ambient" value={preset.ambientIntensity.toFixed(2)} />
                <Meta label="Directional" value={preset.directionalIntensity.toFixed(2)} />
                <Meta label="Fog" value={preset.fogDensity.toFixed(2)} />
              </div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/40 px-3 py-2">
      <p className="uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-white">{value}</p>
    </div>
  );
}
