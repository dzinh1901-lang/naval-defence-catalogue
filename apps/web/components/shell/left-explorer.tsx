'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Cpu,
  Layers,
} from 'lucide-react';
import type { Project, DigitalTwin } from '@naval/domain';
import { cn, statusDotColor } from '@/lib/utils';

interface LeftExplorerProps {
  projects: Project[];
}

export function LeftExplorer({ projects }: LeftExplorerProps) {
  return (
    <aside className="w-56 shrink-0 flex flex-col bg-surface-1 border-r border-border-subtle overflow-hidden">
      {/* Explorer header */}
      <div className="h-8 flex items-center px-3 gap-2 border-b border-border-subtle shrink-0">
        <span className="text-2xs font-semibold text-text-muted tracking-widest uppercase">
          Explorer
        </span>
      </div>

      {/* Project tree */}
      <nav className="flex-1 overflow-y-auto py-1">
        {projects.map((project) => (
          <ProjectTreeItem key={project.id} project={project} />
        ))}
      </nav>

      {/* Footer */}
      <div className="h-7 flex items-center px-3 border-t border-border-subtle shrink-0">
        <span className="text-2xs text-text-dim font-mono">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </span>
      </div>
    </aside>
  );
}

function ProjectTreeItem({ project }: { project: Project }) {
  const pathname = usePathname();
  const isActive = pathname.includes(`/projects/${project.id}`);
  const hasTwins = (project.twins?.length ?? 0) > 0;
  const [expanded, setExpanded] = useState(isActive);

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 h-7 px-2 cursor-pointer select-none',
          'text-xs rounded mx-1',
          isActive
            ? 'bg-accent-dim text-text-primary'
            : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="shrink-0 text-text-dim w-3">
          {hasTwins ? (
            expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          ) : (
            <span className="w-3 inline-block" />
          )}
        </span>

        {expanded ? (
          <FolderOpen size={13} className="shrink-0 text-naval-amber" />
        ) : (
          <Folder size={13} className="shrink-0 text-naval-amber/70" />
        )}

        <Link
          href={`/projects/${project.id}`}
          className="flex-1 truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {project.name}
        </Link>

        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', statusDotColor(project.status))} />
      </div>

      {/* Twin children */}
      {expanded && hasTwins && (
        <div className="tree-line-v ml-5">
          {project.twins?.map((twin) => (
            <TwinTreeItem key={twin.id} twin={twin} projectId={project.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function TwinTreeItem({ twin, projectId }: { twin: DigitalTwin; projectId: string }) {
  const pathname = usePathname();
  const isActive = pathname.includes(`/twins/${twin.id}`);

  return (
    <Link
      href={`/twins/${twin.id}/dashboard`}
      className={cn(
        'flex items-center gap-1.5 h-7 px-2 rounded mx-1 text-xs',
        isActive
          ? 'bg-accent-dim text-text-primary'
          : 'text-text-muted hover:bg-surface-2 hover:text-text-secondary',
      )}
    >
      <Cpu size={12} className="shrink-0 text-naval-cyan/70" />
      <span className="flex-1 truncate">{twin.name}</span>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', statusDotColor(twin.status))} />
    </Link>
  );
}
