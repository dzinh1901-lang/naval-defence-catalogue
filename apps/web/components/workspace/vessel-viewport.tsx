'use client';

import type { ReactNode } from 'react';
import { Gauge, MapPinned, ShieldCheck, Waves } from 'lucide-react';
import type { ViewportHotspot, WorkspacePerformanceSummary, WorkspaceRulesSummary, WorkspaceSectionId, WorkspaceSummary } from '@naval/domain';
import { StatusChip } from './status-chip';
import { VesselHotspotLayer } from './vessel-hotspot-layer';

interface VesselViewportProps {
  summary: WorkspaceSummary;
  performance: WorkspacePerformanceSummary;
  rules: WorkspaceRulesSummary;
  hotspots: ViewportHotspot[];
  selectedHotspotId: string | null;
  activeSection: WorkspaceSectionId;
  onSelectHotspot: (hotspotId: string) => void;
}

export function VesselViewport({
  summary,
  performance,
  rules,
  hotspots,
  selectedHotspotId,
  activeSection,
  onSelectHotspot,
}: VesselViewportProps) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#06111b] shadow-[0_30px_90px_rgba(2,12,21,0.48)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(180deg,_rgba(3,7,18,0.4),_rgba(3,7,18,0.92))]" />
      <div className="absolute inset-0 workspace-grid-overlay opacity-55" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(circle_at_bottom,_rgba(6,182,212,0.25),_transparent_58%)]" />

      <div className="relative z-10 px-5 pb-6 pt-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/65">
              Vessel Viewport
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              {summary.twin.className} / {summary.twin.hullCode}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300/80">
              Static production MVP with engineering hotspots, subsystem callouts, and persisted studio controls.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusChip label="Mode" value={labelForSection(activeSection)} tone="cyan" compact />
            <StatusChip label="Ready" value={`${performance.readinessScore}%`} tone="green" compact />
            <StatusChip label="Rules" value={`${rules.complianceScore}%`} tone="teal" compact />
          </div>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-[#071521]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(45,212,191,0.14),_transparent_42%),linear-gradient(180deg,_rgba(8,20,33,0.1),_rgba(2,6,23,0.82))]" />
          <div className="relative aspect-[16/9] min-h-[320px] w-full sm:min-h-[430px]">
            <VesselArtwork />
            <VesselHotspotLayer
              hotspots={hotspots}
              selectedHotspotId={selectedHotspotId}
              onSelect={onSelectHotspot}
            />

            <div className="absolute left-4 top-4 flex max-w-[240px] flex-wrap gap-2">
              <StatusChip label="Sea State" value="04" tone="neutral" compact />
              <StatusChip label="Sync" value={summary.twin.syncStatus ?? 'Pending'} tone="teal" compact />
            </div>

            <div className="absolute left-4 bottom-4 flex max-w-[260px] flex-col gap-3 rounded-[22px] border border-white/8 bg-slate-950/68 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-slate-200">
                <MapPinned size={15} className="text-cyan-200" />
                <span className="text-sm font-medium">{summary.twin.locationLabel}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-left text-xs text-slate-300/80">
                <MetricTile icon={<Gauge size={14} />} label="Speed" value={`${performance.maxSpeedKnots} kt`} />
                <MetricTile icon={<Waves size={14} />} label="Range" value={`${performance.enduranceNm} nm`} />
                <MetricTile icon={<ShieldCheck size={14} />} label="Stress" value={`${performance.hullStressMarginPct}%`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
      <div className="flex items-center gap-2 text-cyan-100">{icon}</div>
      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function labelForSection(section: WorkspaceSectionId) {
  return section
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function VesselArtwork() {
  return (
    <svg
      viewBox="0 0 1200 675"
      className="absolute inset-0 h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0d2535" />
          <stop offset="100%" stopColor="#050c14" />
        </linearGradient>
        <linearGradient id="hull" x1="0" x2="1">
          <stop offset="0%" stopColor="#7b8ca0" />
          <stop offset="40%" stopColor="#516070" />
          <stop offset="100%" stopColor="#202a35" />
        </linearGradient>
      </defs>

      <rect width="1200" height="675" fill="url(#water)" />
      <path d="M0 470C166 430 326 416 480 418C672 421 902 447 1200 520V675H0V470Z" fill="#08121c" />
      <path d="M140 466C340 448 662 452 930 500" stroke="rgba(69,211,255,0.18)" strokeWidth="3" />
      <path d="M170 494C370 474 690 480 957 527" stroke="rgba(69,211,255,0.12)" strokeWidth="2" />

      <path
        d="M186 404L274 388L358 346L734 336L860 316L1016 344L1048 366L1008 392L940 402L858 412L770 424H330L248 418L186 404Z"
        fill="url(#hull)"
      />
      <path d="M300 352H718L812 327L960 350L915 362H340L300 352Z" fill="#8c9db2" opacity="0.5" />
      <path d="M422 297H540L564 262H636L650 298H730V320H422V297Z" fill="#5f7287" />
      <path d="M574 248H618L630 192H656V248H690L698 175H714L716 253H745V274H574V248Z" fill="#6f8296" />
      <path d="M676 171L707 126L723 171" fill="#7a8ca1" />
      <circle cx="706" cy="113" r="14" fill="#9ce6ff" opacity="0.6" />
      <path d="M512 305H562V332H512V305Z" fill="#283543" />
      <path d="M760 339H872V370H760V339Z" fill="#2d3a47" />
      <path d="M320 362H416V388H320V362Z" fill="#2b3744" />
      <path d="M225 402H980" stroke="rgba(226,232,240,0.28)" strokeDasharray="10 12" />
      <path d="M250 430H950" stroke="rgba(34,211,238,0.18)" strokeDasharray="4 10" />
    </svg>
  );
}
