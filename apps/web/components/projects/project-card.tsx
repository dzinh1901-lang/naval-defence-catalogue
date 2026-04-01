import Link from 'next/link';
import type { Project } from '@naval/domain';
import { ProjectStatus } from '@naval/domain';
import { cn, statusDotColor, formatDate } from '@/lib/utils';
import { Cpu, FileText, AlertCircle } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const statusLabel: Record<ProjectStatus, string> = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
  DRAFT: 'Draft',
};

const statusBg: Record<ProjectStatus, string> = {
  ACTIVE: 'border-naval-green/20 bg-naval-green/5',
  ARCHIVED: 'border-border-subtle bg-surface-1',
  DRAFT: 'border-border-subtle bg-surface-1',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const twinCount = project.twins?.length ?? 0;
  const reqCount = project._count?.requirements ?? 0;
  const reviewCount = project._count?.reviews ?? 0;

  return (
    <Link
      href={`/projects/${project.id}`}
      className={cn(
        'group flex flex-col rounded-lg border p-4 transition-all duration-150',
        'hover:border-accent/40 hover:bg-surface-2/60',
        statusBg[project.status],
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h2 className="text-sm font-semibold text-text-primary leading-tight group-hover:text-white line-clamp-2">
          {project.name}
        </h2>
        <span className="flex items-center gap-1 shrink-0">
          <span className={cn('h-1.5 w-1.5 rounded-full', statusDotColor(project.status))} />
          <span className="text-2xs text-text-muted">{statusLabel[project.status]}</span>
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">
          {project.description}
        </p>
      )}

      {/* Metadata row */}
      <div className="mt-auto flex items-center gap-3 pt-2 border-t border-border-subtle text-2xs text-text-muted">
        <span className="flex items-center gap-1">
          <Cpu size={11} />
          {twinCount} twin{twinCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1">
          <FileText size={11} />
          {reqCount} req{reqCount !== 1 ? 's' : ''}
        </span>
        {reviewCount > 0 && (
          <span className="flex items-center gap-1 text-naval-amber">
            <AlertCircle size={11} />
            {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </span>
        )}
        <span className="ml-auto">{formatDate(project.createdAt)}</span>
      </div>
    </Link>
  );
}
