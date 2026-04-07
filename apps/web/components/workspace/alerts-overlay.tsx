'use client';

import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertEvent } from '@naval/domain';
import { SectionCard } from './section-card';

interface AlertsOverlayProps {
  alerts: AlertEvent[];
  className?: string;
}

const severityStyles: Record<AlertEvent['severity'], string> = {
  CRITICAL: 'border-red-400/35 bg-red-500/10 text-red-100',
  HIGH: 'border-orange-400/35 bg-orange-500/10 text-orange-100',
  MEDIUM: 'border-amber-300/35 bg-amber-400/10 text-amber-100',
  LOW: 'border-cyan-300/25 bg-cyan-400/10 text-cyan-100',
};

export function AlertsOverlay({ alerts, className }: AlertsOverlayProps) {
  return (
    <SectionCard
      title="Critical Alerts"
      eyebrow="Bottom Overlay"
      description="Live feed from alert events seeded in the workspace backend."
      className={className}
    >
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300/75">
            No active alert events for this replay window.
          </div>
        ) : (
          alerts.slice(0, 4).map((alert) => (
            <article
              key={alert.id}
              className="rounded-2xl border border-white/8 bg-white/5 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl border border-white/10 bg-slate-950/60 p-2 text-cyan-100">
                  {alert.severity === 'CRITICAL' ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em]', severityStyles[alert.severity])}>
                      {alert.severity}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      {alert.source}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-white">{alert.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-300/75">{alert.message}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </SectionCard>
  );
}
