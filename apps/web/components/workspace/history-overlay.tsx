'use client';

import { Clock3 } from 'lucide-react';
import type { TwinActivityLog } from '@naval/domain';
import { SectionCard } from './section-card';

interface HistoryOverlayProps {
  history: TwinActivityLog[];
  className?: string;
}

export function HistoryOverlay({ history, className }: HistoryOverlayProps) {
  return (
    <SectionCard
      title="History Feed"
      eyebrow="Bottom Overlay"
      description="Recent twin activity log entries streamed from the API."
      className={className}
    >
      <div className="space-y-3">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300/75">
            No activity recorded for this twin yet.
          </div>
        ) : (
          history.slice(0, 5).map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl border border-white/10 bg-slate-950/60 p-2 text-cyan-100">
                  <Clock3 size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/40">
                    <span>{entry.eventType}</span>
                    <span>{formatTimestamp(entry.occurredAt)}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-white">{entry.summary}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-300/75">{entry.detail ?? 'No additional detail recorded.'}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-cyan-200/65">
                    {(entry.actorName ?? 'System') + (entry.subsystemName ? ` / ${entry.subsystemName}` : '')}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  })} ${date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}
