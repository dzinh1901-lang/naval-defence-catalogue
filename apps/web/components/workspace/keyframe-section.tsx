'use client';

import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KeyframeSequence } from '@naval/domain';
import { SectionCard } from './section-card';

interface KeyframeSectionProps {
  sequences: KeyframeSequence[];
  selectedSequenceId: string | null;
  onSelect: (sequenceId: string) => void;
}

export function KeyframeSection({
  sequences,
  selectedSequenceId,
  onSelect,
}: KeyframeSectionProps) {
  return (
    <SectionCard
      title="Playback and Keyframes"
      eyebrow="Design Studio"
      description="Preset camera journeys for design review playback and future animation hooks."
    >
      <div className="space-y-3">
        {sequences.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300/75">
            No keyframe sequences have been defined yet.
          </div>
        ) : (
          sequences.map((sequence) => {
            const selected = sequence.id === selectedSequenceId;

            return (
              <button
                key={sequence.id}
                type="button"
                onClick={() => onSelect(sequence.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
                  selected
                    ? 'border-cyan-300/30 bg-cyan-400/10'
                    : 'border-white/8 bg-white/5 hover:bg-white/8',
                )}
              >
                <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/50 text-cyan-100">
                  <Play size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-white">{sequence.name}</span>
                  <span className="mt-1 block text-xs text-slate-300/75">{sequence.description}</span>
                  <span className="mt-3 block text-[11px] uppercase tracking-[0.18em] text-white/45">
                    {sequence.durationSeconds}s / {sequence.keyframes.length} keyframes
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}
