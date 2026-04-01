'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Project, DigitalTwin, Subsystem, Requirement, Variant } from '@naval/domain';
import { cn, statusDotColor } from '@/lib/utils';
import { SubsystemTree } from './subsystem-tree';
import { SubsystemInspector } from './subsystem-inspector';
import { VariantsPanel } from './variants-panel';
import { Home, Cpu, Layers, GitBranch, PlayCircle, LayoutGrid } from 'lucide-react';

type ActiveTab = 'overview' | 'variants' | 'simulations';

interface TwinWorkspaceProps {
  project: Project;
  twin: DigitalTwin;
  /** Requirements for this project — fetched server-side from the API. */
  requirements?: Requirement[];
  /** Variants for this twin — fetched server-side from the API. */
  variants?: Variant[];
}

export function TwinWorkspace({ project, twin, requirements = [], variants = [] }: TwinWorkspaceProps) {
  const [selectedSubsystem, setSelectedSubsystem] = useState<Subsystem | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const subsystems = twin.subsystems ?? [];
  const twinVariants = variants.length > 0 ? variants : (twin.variants ?? []);
  const twinSimulations = twin.simulations ?? [];

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutGrid size={12} /> },
    { id: 'variants', label: 'Variants', icon: <GitBranch size={12} />, count: twinVariants.length },
    { id: 'simulations', label: 'Simulations', icon: <PlayCircle size={12} />, count: twinSimulations.length },
  ];

  return (
    <div className="h-full flex overflow-hidden bg-surface-0">
      {/* Left: subsystem tree panel */}
      <div className="w-56 shrink-0 flex flex-col bg-surface-1 border-r border-border-subtle overflow-hidden">
        <div className="h-8 flex items-center px-3 gap-2 border-b border-border-subtle shrink-0">
          <Layers size={12} className="text-naval-cyan" />
          <span className="text-2xs font-semibold text-text-muted tracking-widest uppercase">
            Subsystems
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          <SubsystemTree
            subsystems={subsystems}
            selectedId={selectedSubsystem?.id ?? null}
            onSelect={(s) => {
              setSelectedSubsystem(s);
              if (s) setActiveTab('overview');
            }}
          />
        </div>
      </div>

      {/* Center: main canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas header */}
        <div className="h-10 shrink-0 flex items-center gap-2 px-4 border-b border-border-subtle bg-surface-1">
          <div className="flex items-center gap-2 text-2xs text-text-muted overflow-hidden">
            <Link href="/" className="hover:text-text-secondary flex items-center gap-1">
              <Home size={10} />
              Projects
            </Link>
            <span>/</span>
            <Link href={`/projects/${project.id}`} className="hover:text-text-secondary truncate max-w-[120px]">
              {project.name}
            </Link>
            <span>/</span>
            <span className="text-text-secondary flex items-center gap-1">
              <Cpu size={10} />
              {twin.name}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-2xs text-text-muted">
            <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColor(twin.status))} />
            <span>{twin.status}</span>
            <span className="text-text-dim">·</span>
            <span className="font-mono">v{twin.version}</span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="h-9 shrink-0 flex items-end px-4 gap-1 border-b border-border-subtle bg-surface-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedSubsystem(null); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-2xs border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-muted hover:text-text-secondary',
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={cn(
                  'ml-1 text-2xs rounded-full px-1 min-w-[16px] text-center',
                  activeTab === tab.id ? 'bg-accent/20 text-accent' : 'bg-surface-2 text-text-dim',
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Canvas content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {activeTab === 'overview' && (
            selectedSubsystem ? (
              <SelectedSubsystemView subsystem={selectedSubsystem} requirements={requirements} />
            ) : (
              <TwinOverview twin={twin} subsystems={subsystems} variants={twinVariants} />
            )
          )}
          {activeTab === 'variants' && (
            <div className="space-y-3 workspace-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <GitBranch size={14} className="text-naval-teal" />
                <h2 className="text-sm font-semibold text-text-primary">Variants</h2>
                <span className="text-2xs text-text-muted">({twinVariants.length})</span>
              </div>
              <VariantsPanel variants={twinVariants} />
            </div>
          )}
          {activeTab === 'simulations' && (
            <SimulationsView simulations={twinSimulations} />
          )}
        </div>
      </div>

      {/* Right: inspector */}
      <div className="w-64 shrink-0 flex flex-col bg-surface-1 border-l border-border-subtle overflow-hidden">
        <div className="h-8 flex items-center px-3 gap-2 border-b border-border-subtle shrink-0">
          <span className="text-2xs font-semibold text-text-muted tracking-widest uppercase">
            Inspector
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SubsystemInspector
            subsystem={selectedSubsystem}
            requirements={requirements}
          />
        </div>
      </div>
    </div>
  );
}

function TwinOverview({ twin, subsystems, variants }: { twin: DigitalTwin; subsystems: Subsystem[]; variants: Variant[] }) {
  return (
    <div className="space-y-4 workspace-fade-in">
      <div className="rounded-lg bg-surface-1 border border-border-subtle p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-1">{twin.name}</h2>
        {twin.description && (
          <p className="text-xs text-text-secondary leading-relaxed">{twin.description}</p>
        )}
        <div className="mt-3 pt-3 border-t border-border-subtle grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Subsystems', value: subsystems.length },
            { label: 'Variants', value: variants.length },
            { label: 'Simulations', value: twin.simulations?.length ?? 0 },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-lg font-bold text-text-primary font-engineering">{s.value}</div>
              <div className="text-2xs text-text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-text-muted bg-surface-1 border border-border-subtle rounded-lg p-3">
        <p className="font-medium text-text-secondary mb-1">Select a subsystem</p>
        <p>Click any subsystem in the tree on the left to inspect its details, interfaces, and requirements.</p>
      </div>
    </div>
  );
}

function SelectedSubsystemView({ subsystem, requirements }: { subsystem: Subsystem; requirements: Requirement[] }) {
  const subsysReqs = requirements.filter((r) => r.subsystemId === subsystem.id);

  return (
    <div className="space-y-3 workspace-fade-in">
      <div className="rounded-lg bg-surface-1 border border-border-subtle p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xs font-mono text-naval-cyan bg-naval-cyan/10 px-1.5 py-0.5 rounded">
            {subsystem.identifier}
          </span>
          <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColor(subsystem.status))} />
          <span className="text-2xs text-text-muted">{subsystem.status}</span>
        </div>
        <h2 className="text-sm font-semibold text-text-primary">{subsystem.name}</h2>
        {subsystem.description && (
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">{subsystem.description}</p>
        )}
      </div>

      {subsysReqs.length > 0 && (
        <div className="rounded-lg bg-surface-1 border border-border-subtle">
          <div className="px-4 py-2 border-b border-border-subtle">
            <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider">
              Requirements ({subsysReqs.length})
            </span>
          </div>
          <div className="divide-y divide-border-subtle">
            {subsysReqs.map((req) => (
              <div key={req.id} className="px-4 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xs font-mono text-text-muted">{req.identifier}</span>
                  <span className={cn('text-2xs', req.status === 'APPROVED' ? 'text-naval-green' : req.status === 'REVIEW' ? 'text-naval-amber' : 'text-text-muted')}>
                    {req.status}
                  </span>
                  <span className={cn('text-2xs ml-auto', req.priority === 'MUST' ? 'text-naval-red' : 'text-text-muted')}>
                    {req.priority}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{req.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SimulationsView({ simulations }: { simulations: DigitalTwin['simulations'] }) {
  const sims = simulations ?? [];

  if (sims.length === 0) {
    return (
      <div className="workspace-fade-in flex items-center justify-center h-32 rounded-lg border border-dashed border-border text-text-muted text-sm">
        No simulations defined
      </div>
    );
  }

  const typeColor: Record<string, string> = {
    STATIC: 'text-naval-cyan bg-naval-cyan/10 border-naval-cyan/20',
    DYNAMIC: 'text-naval-teal bg-naval-teal/10 border-naval-teal/20',
    MONTE_CARLO: 'text-naval-indigo bg-naval-indigo/10 border-naval-indigo/20',
  };

  return (
    <div className="space-y-3 workspace-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <PlayCircle size={14} className="text-naval-amber" />
        <h2 className="text-sm font-semibold text-text-primary">Simulations</h2>
        <span className="text-2xs text-text-muted">({sims.length})</span>
      </div>
      {sims.map((sim) => (
        <div key={sim.id} className="rounded-lg border border-border-subtle bg-surface-1 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-2xs border px-1.5 py-0.5 rounded font-medium', typeColor[sim.type] ?? 'text-text-muted bg-surface-2 border-border-subtle')}>
              {sim.type.replace('_', ' ')}
            </span>
          </div>
          <h3 className="text-sm font-medium text-text-primary">{sim.name}</h3>
          {sim.description && (
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">{sim.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
