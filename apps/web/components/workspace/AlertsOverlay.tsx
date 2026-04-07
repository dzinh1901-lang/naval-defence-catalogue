'use client';

import { AlertTriangle, X, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertEvent } from '@naval/domain';
import { AlertSeverity } from '@naval/domain';

interface AlertsOverlayProps {
  alerts: AlertEvent[];
  onClose: () => void;
}

const severityConfig: Record<AlertSeverity, { border: string; bg: string; text: string; icon: string }> = {
  [AlertSeverity.CRITICAL]: {
    border: 'border-naval-red/40',
    bg: 'bg-naval-red/10',
    text: 'text-naval-red',
    icon: 'text-naval-red',
  },
  [AlertSeverity.WARNING]: {
    border: 'border-naval-amber/40',
    bg: 'bg-naval-amber/10',
    text: 'text-naval-amber',
    icon: 'text-naval-amber',
  },
  [AlertSeverity.INFO]: {
    border: 'border-naval-cyan/30',
    bg: 'bg-naval-cyan/10',
    text: 'text-naval-cyan',
    icon: 'text-naval-cyan',
  },
};

export function AlertsOverlay({ alerts, onClose }: AlertsOverlayProps) {
  const active = alerts.filter((a) => !a.resolvedAt);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 z-20 animate-fade-in">
      <div className="rounded-lg border border-border bg-surface-1/95 backdrop-blur-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <AlertTriangle size={12} className="text-naval-red" />
            <span className="text-2xs font-semibold tracking-widest uppercase text-text-secondary">
              Critical Alerts
            </span>
            {active.length > 0 && (
              <span className="text-2xs bg-naval-red/20 text-naval-red px-1.5 rounded-full font-medium">
                {active.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-5 w-5 flex items-center justify-center rounded text-text-dim hover:text-text-secondary hover:bg-surface-3 transition-colors"
          >
            <X size={10} />
          </button>
        </div>

        {/* Alert list */}
        <div className="max-h-40 overflow-y-auto divide-y divide-border-subtle">
          {active.length === 0 ? (
            <div className="px-3 py-3 text-2xs text-text-dim text-center italic">
              No active alerts
            </div>
          ) : (
            active.slice(0, 5).map((alert) => {
              const cfg = severityConfig[alert.severity] ?? severityConfig[AlertSeverity.INFO];
              return (
                <div
                  key={alert.id}
                  className={cn('flex items-start gap-2.5 px-3 py-2.5', cfg.bg)}
                >
                  <AlertTriangle size={12} className={cn('shrink-0 mt-0.5', cfg.icon)} />
                  <div className="min-w-0 flex-1">
                    <div className={cn('text-2xs font-semibold uppercase tracking-wide', cfg.text)}>
                      {alert.title}
                    </div>
                    {alert.message && (
                      <div className="text-2xs text-text-muted mt-0.5 truncate">{alert.message}</div>
                    )}
                  </div>
                  <span
                    className={cn(
                      'shrink-0 text-2xs border px-1 py-0.5 rounded',
                      cfg.border,
                      cfg.text,
                    )}
                  >
                    {alert.severity}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
