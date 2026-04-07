'use client';

import { Clock, X } from 'lucide-react';
import type { TwinActivityLog } from '@naval/domain';

interface HistoryOverlayProps {
  entries: TwinActivityLog[];
  onClose: () => void;
}

export function HistoryOverlay({ entries, onClose }: HistoryOverlayProps) {
  return (
    <div className="absolute bottom-4 right-4 w-72 z-20 animate-slide-in-right">
      <div className="rounded-lg border border-border bg-surface-1/95 backdrop-blur-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-text-muted" />
            <span className="text-2xs font-semibold tracking-widest uppercase text-text-secondary">
              History Log
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-5 w-5 flex items-center justify-center rounded text-text-dim hover:text-text-secondary hover:bg-surface-3 transition-colors"
          >
            <X size={10} />
          </button>
        </div>

        {/* Entries */}
        <div className="max-h-52 overflow-y-auto divide-y divide-border-subtle">
          {entries.length === 0 ? (
            <div className="px-3 py-3 text-2xs text-text-dim text-center italic">
              No history yet
            </div>
          ) : (
            entries.slice(0, 8).map((entry) => (
              <div key={entry.id} className="px-3 py-2 flex items-start gap-2 hover:bg-surface-2/50 transition-colors">
                <span className="h-1.5 w-1.5 rounded-full bg-naval-cyan shrink-0 mt-1.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-2xs text-text-secondary leading-relaxed">
                    <span className="font-mono text-naval-cyan mr-1">{entry.eventType}:</span>
                    {entry.summary}
                    {entry.detail && (
                      <span className="text-text-muted"> — {entry.detail}</span>
                    )}
                    {entry.actorName && (
                      <span className="text-text-dim ml-1">· {entry.actorName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
