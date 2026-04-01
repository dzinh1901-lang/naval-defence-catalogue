'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Project, DigitalTwin, Subsystem, Requirement } from '@naval/domain';
import { cn, statusDotColor } from '@/lib/utils';
import { SubsystemTree } from './subsystem-tree';
import { SubsystemInspector } from './subsystem-inspector';
import { MOCK_REQUIREMENTS } from '@/lib/mock-data';
import { Home, Cpu, Layers } from 'lucide-react';

interface TwinWorkspaceProps {
  project: Project;
  twin: DigitalTwin;
}

export function TwinWorkspace({ project, twin }: TwinWorkspaceProps) {
  const [selectedSubsystem, setSelectedSubsystem] = useState<Subsystem | null>(null);

  const subsystems = twin.subsystems ?? [];
  const requirements = MOCK_REQUIREMENTS.filter((r) => r.projectId === project.id);

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
            onSelect={setSelectedSubsystem}
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

        {/* Canvas content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {selectedSubsystem ? (
            <SelectedSubsystemView subsystem={selectedSubsystem} requirements={requirements} />
          ) : (
            <TwinOverview twin={twin} subsystems={subsystems} />
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

function TwinOverview({ twin, subsystems }: { twin: DigitalTwin; subsystems: Subsystem[] }) {
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
            { label: 'Variants', value: twin.variants?.length ?? 3 },
            { label: 'Simulations', value: twin.simulations?.length ?? 1 },
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
