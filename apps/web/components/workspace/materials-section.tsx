'use client';

import { cn } from '@/lib/utils';
import type { MaterialPreset } from '@naval/domain';
import { SectionCard } from './section-card';

interface MaterialsSectionProps {
  presets: MaterialPreset[];
  selectedPresetId: string | null;
  onSelect: (presetId: string) => void;
}

export function MaterialsSection({
  presets,
  selectedPresetId,
  onSelect,
}: MaterialsSectionProps) {
  return (
    <SectionCard
      title="Materials"
      eyebrow="Design Studio"
      description="Persisted hull, deck, and diagnostic material looks for the twin hero."
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
                  ? 'border-cyan-300/30 bg-cyan-400/10'
                  : 'border-white/8 bg-white/5 hover:bg-white/8',
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[preset.hullColor, preset.deckColor, preset.accentColor].map((color) => (
                    <span
                      key={color}
                      className="h-8 w-8 rounded-xl border border-white/15"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{preset.name}</span>
                    {preset.isDefault ? (
                      <span className="rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-300/75">{preset.description}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-300/75">
                <Meta label="Finish" value={preset.finish} />
                <Meta label="Roughness" value={preset.roughness.toFixed(2)} />
                <Meta label="Reflect" value={preset.reflectivity.toFixed(2)} />
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
