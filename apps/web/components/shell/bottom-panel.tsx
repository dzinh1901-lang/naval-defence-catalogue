'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, Terminal, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type PanelTab = 'activity' | 'console' | 'alerts';

export function BottomPanel() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>('activity');

  const TABS: { id: PanelTab; label: string; icon: ReactNode; badge?: number }[] = [
    { id: 'activity', label: 'Activity', icon: <Activity size={12} /> },
    { id: 'console', label: 'Console', icon: <Terminal size={12} /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertCircle size={12} />, badge: 1 },
  ];

  return (
    <div className={cn('shrink-0 border-t border-border-subtle bg-surface-1 transition-all duration-150', open ? 'h-40' : 'h-7')}>
      {/* Tab bar */}
      <div className="h-7 flex items-center border-b border-border-subtle px-2 gap-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (activeTab === tab.id) {
                setOpen((v) => !v);
              } else {
                setActiveTab(tab.id);
                setOpen(true);
              }
            }}
            className={cn(
              'flex items-center gap-1 h-5 px-2 rounded text-2xs transition-colors',
              activeTab === tab.id && open
                ? 'bg-accent-dim text-accent'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge != null && (
              <span className="ml-0.5 bg-naval-amber/80 text-canvas rounded-full h-3.5 min-w-[14px] flex items-center justify-center text-2xs font-semibold px-0.5">
                {tab.badge}
              </span>
            )}
          </button>
        ))}

        <div className="flex-1" />

        <button
          onClick={() => setOpen((v) => !v)}
          className="h-5 w-5 flex items-center justify-center text-text-dim hover:text-text-muted rounded transition-colors"
        >
          {open ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
        </button>
      </div>

      {/* Panel content */}
      {open && (
        <div className="overflow-y-auto h-[calc(100%-1.75rem)] px-3 py-2">
          {activeTab === 'activity' && <ActivityLog />}
          {activeTab === 'console' && <ConsoleLog />}
          {activeTab === 'alerts' && <AlertsLog />}
        </div>
      )}
    </div>
  );
}

function ActivityLog() {
  const events = [
    { time: '09:42', text: 'SimulationRun COMPLETED — Propulsion Performance Envelope', variant: 'success' },
    { time: '09:00', text: 'SimulationRun STARTED — Propulsion Performance Envelope', variant: 'info' },
    { time: '08:30', text: 'Review updated: CMS Architecture PDR → IN_REVIEW', variant: 'info' },
    { time: 'Yesterday', text: 'DigitalTwin T52 Baseline v1.0.0 created', variant: 'neutral' },
  ];

  return (
    <div className="space-y-1">
      {events.map((e, i) => (
        <div key={i} className="flex items-start gap-2 text-2xs">
          <span className="text-text-dim w-14 shrink-0 font-mono pt-px">{e.time}</span>
          <span className={cn(
            e.variant === 'success' ? 'text-naval-green' :
            e.variant === 'info' ? 'text-naval-cyan' :
            'text-text-muted'
          )}>{e.text}</span>
        </div>
      ))}
    </div>
  );
}

function ConsoleLog() {
  return (
    <div className="font-mono text-2xs text-text-muted space-y-0.5">
      <div><span className="text-naval-green">✔</span> API connection established — http://localhost:4000/api/v1</div>
      <div><span className="text-naval-cyan">i</span> Loaded 3 projects, 1 active digital twin</div>
      <div><span className="text-naval-amber">⚠</span> Mock data mode — connect to API for live data</div>
    </div>
  );
}

function AlertsLog() {
  return (
    <div className="space-y-1 text-2xs">
      <div className="flex items-start gap-2">
        <span className="text-naval-amber shrink-0">⚠</span>
        <span className="text-text-secondary">REQ-003 (Acoustic signature) is in REVIEW state — awaiting approval from Dr. M. Chen</span>
      </div>
    </div>
  );
}
