'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type {
  WorkspaceAgentCollaborationResponse,
  WorkspaceDashboardPayload,
  WorkspaceSectionId,
} from '@naval/domain';
import { Bot, Loader2, PlayCircle, Radar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionCard } from './section-card';
import { StatusChip } from './status-chip';
import { VesselViewport } from './vessel-viewport';

interface TwinOperationsDashboardProps {
  twinId: string;
  data: WorkspaceDashboardPayload;
}

interface RenderProgram {
  id: string;
  name: string;
  description: string;
  selectedMaterialPresetId: string | null;
  selectedLightingPresetId: string | null;
  selectedCameraPresetId: string | null;
  cameraState?: {
    yaw: number;
    pitch: number;
    zoom: number;
    fieldOfView: number;
  };
}

type RunState = 'idle' | 'running' | 'done' | 'error';

export function TwinOperationsDashboard({ twinId, data }: TwinOperationsDashboardProps) {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(
    data.viewConfig.config.selectedHotspotId ?? data.hotspots[0]?.id ?? null,
  );
  const [activeSection, setActiveSection] = useState<WorkspaceSectionId>(
    data.viewConfig.config.activeSection ?? 'design-studio',
  );
  const [renderState, setRenderState] = useState<RunState>('idle');
  const [renderMessage, setRenderMessage] = useState<string | null>(null);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);

  const [prompt, setPrompt] = useState('Optimize sonar mast visibility for sea state 4.');
  const [agentState, setAgentState] = useState<RunState>('idle');
  const [agentResult, setAgentResult] = useState<WorkspaceAgentCollaborationResponse | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);

  const renderPrograms = useMemo(() => {
    const materials = data.viewConfig.materials;
    const lighting = data.viewConfig.lightingPresets;
    const camera = data.viewConfig.cameraPresets;

    const byIndex = <T,>(items: T[], index: number) =>
      items.length > 0 ? items[index % items.length] : null;

    const presets = [
      {
        id: 'threat-scan',
        name: 'Threat Scan',
        description: 'High-contrast tactical sweep for surface and radar assets.',
      },
      {
        id: 'thermal-watch',
        name: 'Thermal Watch',
        description: 'Warm-light profile to inspect hull stress and thermal signatures.',
      },
      {
        id: 'night-operations',
        name: 'Night Operations',
        description: 'Low-light rendering tuned for mission timeline playback.',
      },
    ];

    return presets.map((preset, index): RenderProgram => {
      const material = byIndex(materials, index);
      const light = byIndex(lighting, index);
      const cam = byIndex(camera, index);

      const baseProgram: RenderProgram = {
        ...preset,
        selectedMaterialPresetId: material?.id ?? null,
        selectedLightingPresetId: light?.id ?? null,
        selectedCameraPresetId: cam?.id ?? null,
      };

      if (cam) {
        baseProgram.cameraState = {
          yaw: cam.yaw,
          pitch: cam.pitch,
          zoom: cam.zoom,
          fieldOfView: cam.fieldOfView,
        };
      }

      return baseProgram;
    });
  }, [data.viewConfig]);

  async function runRenderProgram(program: RenderProgram) {
    setRenderState('running');
    setActiveProgramId(program.id);
    setRenderMessage(null);

    try {
      const response = await fetch(`/api/workspace/${twinId}/view-config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeSection: 'design-studio',
          selectedMaterialPresetId: program.selectedMaterialPresetId,
          selectedLightingPresetId: program.selectedLightingPresetId,
          selectedCameraPresetId: program.selectedCameraPresetId,
          cameraState: program.cameraState,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = await response.json();
      setActiveSection(payload.config.activeSection ?? 'design-studio');
      setSelectedHotspotId(payload.config.selectedHotspotId ?? selectedHotspotId);
      setRenderState('done');
      setRenderMessage(`${program.name} program applied and persisted.`);
    } catch (error) {
      setRenderState('error');
      setRenderMessage(
        error instanceof Error ? error.message : 'Failed to apply render program.',
      );
    } finally {
      setActiveProgramId(null);
    }
  }

  async function collaborateWithAgent() {
    setAgentState('running');
    setAgentError(null);

    try {
      const response = await fetch(`/api/workspace/${twinId}/agent-collaborate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt, topK: 6 }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as WorkspaceAgentCollaborationResponse;
      setAgentResult(payload);
      setAgentState('done');
    } catch (error) {
      setAgentState('error');
      setAgentError(error instanceof Error ? error.message : 'Agent request failed.');
    }
  }

  return (
    <div className="min-h-screen overflow-auto bg-[linear-gradient(180deg,#02060f_0%,#071221_52%,#02060f_100%)] text-white">
      <div className="mx-auto w-full max-w-[1840px] space-y-5 p-4 md:p-6">
        <header className="rounded-[24px] border border-white/10 bg-slate-950/70 px-5 py-4 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">
                Naval Defence Catalogue
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Digital Twin Operations Dashboard</h1>
              <p className="mt-1 text-sm text-slate-300/80">
                {data.summary.twin.name} · {data.summary.twin.className} · {data.summary.twin.hullCode}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusChip label="Agent" value={data.agent.status} tone="teal" />
              <StatusChip label="Twin" value={data.summary.twin.status} tone="cyan" />
              <Link
                href={`/projects/${data.summary.project.id}`}
                className="inline-flex h-9 items-center rounded-full border border-white/15 bg-white/5 px-4 text-xs text-slate-100 hover:bg-white/10"
              >
                Project Workspace
              </Link>
              <Link
                href={`/twins/${twinId}/workspace`}
                className="inline-flex h-9 items-center rounded-full border border-cyan-300/25 bg-cyan-400/12 px-4 text-xs text-cyan-50 hover:bg-cyan-400/20"
              >
                Open Design Studio
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {data.kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="rounded-[20px] border border-white/10 bg-slate-950/65 p-4 backdrop-blur-xl"
            >
              <p className="text-[11px] uppercase tracking-[0.26em] text-cyan-200/65">{kpi.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {kpi.value}
                {kpi.unit ? <span className="ml-1 text-base text-slate-300/75">{kpi.unit}</span> : null}
              </p>
              <p
                className={cn(
                  'mt-2 text-xs',
                  kpi.trend === 'up'
                    ? 'text-emerald-300'
                    : kpi.trend === 'down'
                      ? 'text-red-300'
                      : 'text-slate-300/80',
                )}
              >
                {kpi.deltaText ?? 'Live update'}
              </p>
            </div>
          ))}
        </section>

        <SectionCard
          title="Trends, Render Programs, and Co-Design Agent"
          eyebrow="Trend Operations"
          description="Live telemetry trends plus programmable render presets and agent-assisted modeling support."
          aside={<StatusChip label="Model" value={data.agent.modelLabel} tone="neutral" compact />}
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <VesselViewport
                summary={data.summary}
                performance={data.performance}
                rules={data.rules}
                hotspots={data.hotspots}
                selectedHotspotId={selectedHotspotId}
                activeSection={activeSection}
                onSelectHotspot={setSelectedHotspotId}
              />

              <div className="grid gap-3 md:grid-cols-2">
                <TrendSparkline
                  title="Readiness Trend"
                  unit="%"
                  points={data.trends.map((point) => ({
                    label: point.label,
                    value: point.readinessScore,
                  }))}
                  strokeClass="stroke-emerald-300"
                  fillClass="fill-emerald-400/15"
                />
                <TrendSparkline
                  title="Combat Latency Trend"
                  unit="ms"
                  points={data.trends.map((point) => ({
                    label: point.label,
                    value: point.combatLatencyMs,
                  }))}
                  strokeClass="stroke-cyan-300"
                  fillClass="fill-cyan-400/15"
                />
              </div>

              <div className="rounded-[20px] border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2">
                  <PlayCircle size={15} className="text-cyan-200" />
                  <p className="text-sm font-semibold text-white">Programmable Render Programs</p>
                </div>
                <p className="mt-1 text-xs text-slate-300/80">
                  Programs persist via workspace view-config PATCH for repeatable digital twin render states.
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {renderPrograms.map((program) => {
                    const busy = activeProgramId === program.id && renderState === 'running';
                    return (
                      <button
                        key={program.id}
                        type="button"
                        onClick={() => runRenderProgram(program)}
                        disabled={busy}
                        className="rounded-2xl border border-cyan-300/20 bg-cyan-400/8 px-3 py-3 text-left hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <p className="text-sm font-medium text-cyan-50">{program.name}</p>
                        <p className="mt-1 text-xs leading-5 text-cyan-100/70">{program.description}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-cyan-200/60">
                          {busy ? 'Applying' : 'Run Program'}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {renderMessage ? (
                  <p
                    className={cn(
                      'mt-3 text-xs',
                      renderState === 'error' ? 'text-red-300' : 'text-emerald-300',
                    )}
                  >
                    {renderMessage}
                  </p>
                ) : null}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-cyan-200" />
                  <h3 className="text-sm font-semibold text-white">{data.agent.name}</h3>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-300/80">
                  Submit a design or modeling instruction to retrieve subsystem-aware recommendations.
                </p>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={4}
                  className="mt-3 w-full rounded-xl border border-white/15 bg-slate-950/85 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/45"
                />
                <button
                  type="button"
                  onClick={collaborateWithAgent}
                  disabled={agentState === 'running'}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/12 text-sm text-cyan-50 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {agentState === 'running' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {agentState === 'running' ? 'Collaborating...' : 'Collaborate with Agent'}
                </button>
                {agentError ? <p className="mt-2 text-xs text-red-300">{agentError}</p> : null}

                {agentResult ? (
                  <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-xs text-slate-200">{agentResult.summary}</p>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/70">Recommendations</p>
                      <div className="mt-2 space-y-1.5">
                        {agentResult.recommendations.slice(0, 4).map((item) => (
                          <p key={item} className="text-xs text-slate-300/85">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/70">References</p>
                      <div className="mt-2 space-y-1.5">
                        {agentResult.references.length === 0 ? (
                          <p className="text-xs text-slate-400">No references found for this prompt.</p>
                        ) : (
                          agentResult.references.slice(0, 4).map((reference) => (
                            <p key={reference.id} className="text-xs text-slate-300/85">
                              <span className="text-cyan-200/80">{reference.kind}</span> · {reference.title}
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-[20px] border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center gap-2 text-cyan-100">
                  <Radar size={15} />
                  <h3 className="text-sm font-semibold">Assumptions</h3>
                </div>
                <div className="mt-3 space-y-2">
                  {data.assumptions.map((assumption) => (
                    <p key={assumption} className="text-xs leading-5 text-slate-300/80">
                      {assumption}
                    </p>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </SectionCard>

        <SectionCard
          title="Subsystem Breakdown Table"
          eyebrow="Breakdown"
          description="Operational view across hotspots, health scores, telemetry, and unresolved alerts."
        >
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-xs">
                <thead className="bg-slate-900/70 text-slate-300">
                  <tr>
                    <th className="px-3 py-2 font-medium">Subsystem</th>
                    <th className="px-3 py-2 font-medium">Category</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Health</th>
                    <th className="px-3 py-2 font-medium">Open Alerts</th>
                    <th className="px-3 py-2 font-medium">Telemetry Sample</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-slate-950/60 text-slate-200">
                  {data.breakdown.map((row) => {
                    const telemetryPair = Object.entries(row.telemetry)[0];
                    return (
                      <tr key={row.hotspotId} className="hover:bg-white/5">
                        <td className="px-3 py-2">
                          <p className="font-medium text-white">{row.subsystemName}</p>
                          <p className="text-[11px] text-slate-400">{row.subsystemIdentifier}</p>
                        </td>
                        <td className="px-3 py-2 uppercase tracking-[0.2em] text-cyan-100/80">
                          {row.category}
                        </td>
                        <td className="px-3 py-2">{row.hotspotStatus}</td>
                        <td className="px-3 py-2">{row.healthScore}%</td>
                        <td className="px-3 py-2">{row.openAlerts}</td>
                        <td className="px-3 py-2 text-slate-300/85">
                          {telemetryPair ? `${telemetryPair[0]}: ${String(telemetryPair[1])}` : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function TrendSparkline({
  title,
  unit,
  points,
  strokeClass,
  fillClass,
}: {
  title: string;
  unit: string;
  points: Array<{ label: string; value: number }>;
  strokeClass: string;
  fillClass: string;
}) {
  const chart = toChartPath(points, 320, 120);
  const latest = points[points.length - 1]?.value;

  return (
    <div className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-slate-300/80">
          {latest ?? 'N/A'} {unit}
        </p>
      </div>
      <svg viewBox="0 0 320 120" className="mt-3 h-28 w-full">
        <path d={chart.areaPath} className={fillClass} />
        <path d={chart.path} fill="none" className={cn('stroke-[2.4]', strokeClass)} />
        {chart.points.map((point) => (
          <circle
            key={point.id}
            cx={point.x}
            cy={point.y}
            r="2.5"
            className={cn('fill-white/90', strokeClass.replace('stroke-', 'text-'))}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.16em] text-slate-400">
        <span>{points[0]?.label ?? '-'}</span>
        <span>{points[points.length - 1]?.label ?? '-'}</span>
      </div>
    </div>
  );
}

function toChartPath(points: Array<{ label: string; value: number }>, width: number, height: number) {
  if (points.length === 0) {
    return {
      path: '',
      areaPath: '',
      points: [] as Array<{ id: string; x: number; y: number }>,
    };
  }

  const minValue = Math.min(...points.map((point) => point.value));
  const maxValue = Math.max(...points.map((point) => point.value));
  const range = Math.max(1, maxValue - minValue);
  const xStep = points.length === 1 ? 0 : width / (points.length - 1);
  const yPadding = 10;
  const ySpan = height - yPadding * 2;

  const mapped = points.map((point, index) => {
    const normalized = (point.value - minValue) / range;
    const y = height - yPadding - normalized * ySpan;
    return {
      id: `${point.label}-${index}`,
      x: index * xStep,
      y,
    };
  });

  const path = mapped
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return {
    path,
    areaPath,
    points: mapped,
  };
}
