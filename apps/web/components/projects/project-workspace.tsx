'use client';

import Link from 'next/link';
import type { Project } from '@naval/domain';
import { cn, statusDotColor } from '@/lib/utils';
import { Cpu, FileText, GitBranch, PlayCircle, ArrowRight, Home } from 'lucide-react';

interface ProjectWorkspaceProps {
  project: Project;
}

export function ProjectWorkspace({ project }: ProjectWorkspaceProps) {
  const twinCount = project.twins?.length ?? 0;

  return (
    <div className="h-full flex flex-col overflow-auto bg-surface-0">
      {/* Page header */}
      <div className="bg-surface-1 border-b border-border-subtle px-6 py-4 shrink-0">
        <div className="flex items-center gap-2 text-2xs text-text-muted mb-2">
          <Link href="/" className="hover:text-text-secondary flex items-center gap-1">
            <Home size={11} />
            Projects
          </Link>
          <span>/</span>
          <span className="text-text-secondary">{project.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-text-primary">{project.name}</h1>
          <span className="flex items-center gap-1 text-2xs">
            <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColor(project.status))} />
            <span className="text-text-muted">{project.status}</span>
          </span>
        </div>
        {project.description && (
          <p className="text-xs text-text-secondary mt-1">{project.description}</p>
        )}
      </div>

      {/* Dashboard grid */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Digital Twins', value: twinCount, icon: <Cpu size={16} />, color: 'text-naval-cyan' },
              { label: 'Requirements', value: project.id === 'proj-t52' ? 6 : 0, icon: <FileText size={16} />, color: 'text-naval-indigo' },
              { label: 'Variants', value: project.id === 'proj-t52' ? 3 : 0, icon: <GitBranch size={16} />, color: 'text-naval-teal' },
              { label: 'Simulations', value: project.id === 'proj-t52' ? 1 : 0, icon: <PlayCircle size={16} />, color: 'text-naval-amber' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-surface-1 border border-border-subtle p-3">
                <div className={cn('mb-1', stat.color)}>{stat.icon}</div>
                <div className="text-xl font-bold text-text-primary font-engineering">{stat.value}</div>
                <div className="text-2xs text-text-muted mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Digital Twins section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Digital Twins
              </h2>
            </div>

            {twinCount > 0 ? (
              <div className="space-y-2">
                {project.twins?.map((twin) => (
                  <Link
                    key={twin.id}
                    href={`/projects/${project.id}/twins/${twin.id}`}
                    className="flex items-center gap-3 rounded-lg bg-surface-1 border border-border-subtle hover:border-accent/40 hover:bg-surface-2/60 p-3 transition-all group"
                  >
                    <div className="h-8 w-8 rounded bg-naval-cyan/10 border border-naval-cyan/20 flex items-center justify-center shrink-0">
                      <Cpu size={14} className="text-naval-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary group-hover:text-white">{twin.name}</div>
                      <div className="text-2xs text-text-muted mt-0.5">v{twin.version} · {twin.subsystems?.length ?? 0} subsystems</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColor(twin.status))} />
                      <span className="text-2xs text-text-muted">{twin.status}</span>
                      <ArrowRight size={13} className="text-text-dim group-hover:text-accent transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border text-text-muted text-sm">
                No digital twins yet
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
